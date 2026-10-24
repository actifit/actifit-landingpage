/**
 * Every upstream call from the actifit.io proxy must carry a timeout, and an unavailable
 * upstream must never be reported to a user as a bad password.
 *
 * Right after the signed-challenge login deployed (2026-10-24), the login routes returned
 * 504s or took 13-16s while the API answered directly in under a second. None of the
 * proxy's eight upstream calls had a timeout, so a stalled request hung, the Nuxt server
 * held it open, and requests piled up until Cloudflare gave up.
 *
 * Worse, the client recognised only 503 as "service unavailable". A Cloudflare edge 504 -
 * which never reaches the proxy code, so the proxy cannot translate it - fell through to
 * "your account and/or private posting key is incorrect". Everyone caught in that window
 * would have been told their key was wrong.
 */
import fs from 'fs'
import path from 'path'
import signedChallengeLogin from '@/mixins/signedChallengeLogin'

const src = fs.readFileSync(path.resolve(__dirname, '../../../api/proxy.js'), 'utf8')

describe('proxy upstream calls', () => {
  it('none call raw axios - all go through the timed instance', () => {
    const lines = src.split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l))
    const raw = lines.filter((l) => /await axios[.(]/.test(l))
    expect(raw).toEqual([])
  })

  it('the instance has a default timeout', () => {
    expect(src).toMatch(/axios\.create\(\{\s*timeout:\s*\d+/)
  })

  it('does not change the process-wide axios defaults', () => {
    // require('axios') is a singleton: editing its defaults here would silently retime
    // every other axios caller in the server.
    expect(src).not.toMatch(/axios\.defaults\.timeout/)
  })

  it('every upstream call sets an explicit per-purpose timeout', () => {
    const calls = src.match(/await http(\.\w+)?\(/g) || []
    const timeouts = src.match(/timeout:\s*T\.\w+/g) || []
    expect(calls.length).toBeGreaterThanOrEqual(8)
    expect(timeouts.length).toBe(calls.length)
  })

  it('login times out before the client\'s 20s abort', () => {
    // The proxy must give up FIRST and return a real error; otherwise the browser's own
    // abort or Cloudflare's 504 decides what the user sees.
    const m = src.match(/login:\s*(\d+)/)
    expect(m).not.toBeNull()
    expect(Number(m[1])).toBeLessThan(20000)
  })

  it('payment confirmation is generous but under Cloudflare\'s 100s', () => {
    // A premature timeout does not cancel the upstream - the payment may still confirm -
    // so it would tell the user it failed when it did not, and invite a second payment.
    const m = src.match(/payment:\s*(\d+)/)
    expect(Number(m[1])).toBeGreaterThanOrEqual(60000)
    expect(Number(m[1])).toBeLessThan(100000)
  })

  it('a failure with no upstream response is answered 503, never 500', () => {
    expect(src).not.toMatch(/error\.response \? error\.response\.status : 500/)
    expect(src).not.toMatch(/error\.statusCode \|\| 500/)
  })
})

describe('login client: an unavailable server is not a bad password', () => {
  const makeVm = () => {
    const vm = { error_proceeding: false, error_msg: '', login_in_progress: true,
      keep_loggedin_val: false, $t: (k) => k }
    Object.keys(signedChallengeLogin.methods).forEach((k) => {
      vm[k] = signedChallengeLogin.methods[k].bind(vm)
    })
    return vm
  }
  afterEach(() => { delete global.fetch })

  // 504 is what was actually observed; the rest are Cloudflare's other edge errors.
  ;[500, 502, 503, 504, 520, 522, 524].forEach((status) => {
    it(status + ' on /loginChallenge says "try again", not "wrong key"', async () => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: false, status, json: () => Promise.reject(new SyntaxError('error code: ' + status))
      }))
      const vm = makeVm()

      await expect(vm.requestLoginChallenge('alice')).resolves.toBeNull()
      expect(vm.error_msg).toBe('login_service_unavailable')
      expect(vm.login_in_progress).toBe(false)
    })

    it(status + ' on /loginVerify says "try again", not "wrong key"', async () => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: false, status, json: () => Promise.reject(new SyntaxError('error code: ' + status))
      }))
      const vm = makeVm()

      await vm.submitLoginVerify('alice', 'a'.repeat(64), 'ab'.repeat(65), 'keychain')
      expect(vm.error_msg).toBe('login_service_unavailable')
    })
  })

  it('a 4xx that is not a credential failure still reports a login error', async () => {
    // Guard against over-correcting: only 5xx means "the service is down".
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false, status: 400, json: () => Promise.resolve({ success: false, message: 'Invalid username' })
    }))
    const vm = makeVm()

    await vm.requestLoginChallenge('alice')
    expect(vm.error_msg).toBe('login_error')
  })
})
