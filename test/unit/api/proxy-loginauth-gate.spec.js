/**
 * Behavioural guard for the posting-key login kill switch at its ENFORCEMENT point.
 *
 * WHY THIS FILE EXISTS: the first version of this coverage asserted against the TEXT of
 * api/proxy.js with regexes. Review demonstrated that a realistic refactor - moving the
 * 410 gate below the forwarding block - keeps every one of those assertions green while
 * the proxy happily forwards a plaintext posting key upstream:
 *
 *     >>> FORWARDED to https://api.actifit.io/loginAuth
 *         BODY: {"username":"victim","ppkey":"5K...","bchain":"HIVE"}
 *     <<< STATUS 200
 *
 * A source-text assertion cannot see ordering, so it cannot guard the one property that
 * matters. These tests invoke the real handler and assert on what it DOES: that no
 * request carrying a key is ever forwarded, and that the two signature-based endpoints
 * are still forwarded untouched.
 *
 * The client-side flags in LoginModal.vue and pages/login.vue are the UI; this is the
 * control. It is what stops curl, a phishing page on any origin, a browser tab running
 * the pre-deploy bundle, and the mobile app if it routes through actifit.io.
 */
jest.mock('axios')
const axios = require('axios')
const proxy = require('../../../api/proxy')

let ipCounter = 0
const call = (path, { method = 'POST', body = '{}' } = {}) => {
  const chunks = []
  let statusCode = 200
  const req = {
    url: path,
    method,
    headers: { 'content-type': 'application/json' },
    // The proxy rate-limits per IP (10/60s) and reads socket.remoteAddress. A unique IP
    // per call keeps the limiter from turning a forwarding assertion into a 429 and
    // making this suite pass for the wrong reason.
    socket: { remoteAddress: '10.0.0.' + (++ipCounter) },
    on (event, cb) {
      // readRequestBody consumes the stream; feed it synchronously.
      if (event === 'data') cb(Buffer.from(body))
      if (event === 'end') cb()
      return req
    }
  }
  const res = {
    setHeader: jest.fn(),
    get statusCode () { return statusCode },
    set statusCode (v) { statusCode = v },
    end: jest.fn((payload) => { if (payload) chunks.push(String(payload)) })
  }
  return Promise.resolve(proxy(req, res)).then(() => ({
    status: statusCode,
    body: chunks.join(''),
    res
  }))
}

// A key-shaped value, so a failure message makes the leak obvious.
const KEY_BODY = JSON.stringify({ username: 'victim', ppkey: '5KPLAINTEXTPOSTINGKEY', bchain: 'HIVE' })

describe('api/proxy — /loginAuth is refused while the kill switch is off', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    axios.post.mockResolvedValue({ data: { success: true, token: 'tok' } })
  })

  it('NEVER forwards a request carrying a posting key', async () => {
    // The load-bearing assertion. Status alone would pass against an implementation
    // that forwards first and then overwrites the response.
    const { status } = await call('/loginAuth', { body: KEY_BODY })

    expect(axios.post).not.toHaveBeenCalled()
    expect(status).toBe(410)
    // And the key must not be echoed back either.
    expect(JSON.stringify(axios.post.mock.calls)).not.toContain('5KPLAINTEXTPOSTINGKEY')
  })

  it.each([
    ['plain', '/loginAuth'],
    ['with a query string', '/loginAuth?x=1'],
    ['with a fragment', '/loginAuth#frag'],
  ])('refuses %s', async (_label, path) => {
    const { status } = await call(path, { body: KEY_BODY })
    expect(axios.post).not.toHaveBeenCalled()
    expect(status).toBe(410)
  })

  it('refuses a GET too, rather than answering 405', async () => {
    // The gate deliberately precedes the method check: a 405 would tell an attacker the
    // route still exists and is merely mis-invoked.
    const { status } = await call('/loginAuth', { method: 'GET' })
    expect(axios.post).not.toHaveBeenCalled()
    expect(status).toBe(410)
  })

  it.each(['/loginAuth/', '/LoginAuth', '//loginAuth', '/loginAuth%20'])(
    'fails closed on the near-miss %s (never forwarded)', async (path) => {
      // Structurally guaranteed rather than lucky: the gate and the forwarder compare
      // against the same literal, so anything evading the gate also evades forwarding.
      await call(path, { body: KEY_BODY })
      expect(axios.post).not.toHaveBeenCalled()
    })

  it.each(['/loginKeychain', '/loginKeychainVerify'])(
    'still forwards %s - these carry a signature, not a key', async (path) => {
      // The switch must not take down the login methods users are being told to use.
      // Without this, "refuse everything" would pass every test above.
      const { status } = await call(path, { body: JSON.stringify({ username: 'alice' }) })

      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(axios.post.mock.calls[0][0]).toContain(path.slice(1))
      expect(status).toBe(200)
    })
})
