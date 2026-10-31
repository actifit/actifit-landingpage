/**
 * /loginChallenge is retried once after a dropped connection or a 5xx (each try gets a
 * fresh nonce, so it is harmless); /loginVerify is never retried (single-use nonce).
 * A dropped connection says "check your connection", a failing server "try again later".
 */
import signedChallengeLogin from '~/mixins/signedChallengeLogin'

const NONCE = 'a'.repeat(64)
const challengeOk = (user) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true, nonce: NONCE, message: 'Log in to actifit.io\nuser: ' + user + '\nnonce: ' + NONCE })
})
const status = (code) => ({ ok: false, status: code, json: () => Promise.reject(new SyntaxError('not json')) })
const dropped = () => Promise.reject(new TypeError('Failed to fetch'))
const aborted = () => { const e = new Error('aborted'); e.name = 'AbortError'; return Promise.reject(e) }

function makeVm () {
  const vm = { error_proceeding: false, error_msg: '', login_in_progress: true, keep_loggedin_val: false, $t: (k) => k }
  Object.keys(signedChallengeLogin.methods).forEach((k) => { vm[k] = signedChallengeLogin.methods[k].bind(vm) })
  return vm
}

describe('login challenge retry', () => {
  afterEach(() => { delete global.fetch })

  it('a dropped connection followed by success logs in without an error', async () => {
    global.fetch = jest.fn().mockImplementationOnce(dropped).mockImplementationOnce(() => Promise.resolve(challengeOk('alice')))
    const vm = makeVm()
    const json = await vm.requestLoginChallenge('alice')
    expect(json && json.nonce).toBe(NONCE)
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(vm.error_msg).toBe('')
  })

  it('a 503 followed by success logs in without an error', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve(status(503))).mockImplementationOnce(() => Promise.resolve(challengeOk('alice')))
    const vm = makeVm()
    expect(await vm.requestLoginChallenge('alice')).not.toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('two dropped connections say "check your connection"', async () => {
    global.fetch = jest.fn(dropped)
    const vm = makeVm()
    expect(await vm.requestLoginChallenge('alice')).toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(vm.error_msg).toBe('login_connection_problem')
    expect(vm.login_in_progress).toBe(false)
  })

  it('a timeout is not retried and says the service is unavailable', async () => {
    global.fetch = jest.fn(aborted)
    const vm = makeVm()
    expect(await vm.requestLoginChallenge('alice')).toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(vm.error_msg).toBe('login_service_unavailable')
  })

  it('a wrong-credentials answer (4xx) is not retried', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ success: false }) }))
    const vm = makeVm()
    expect(await vm.requestLoginChallenge('alice')).toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(vm.error_msg).toBe('login_error')
  })

  it('loginVerify is never retried; a dropped connection says "check your connection"', async () => {
    global.fetch = jest.fn(dropped)
    const vm = makeVm()
    expect(await vm.submitLoginVerify('alice', NONCE, 'ab'.repeat(65), 'posting')).toBeNull()
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(vm.error_msg).toBe('login_connection_problem')
  })
})
