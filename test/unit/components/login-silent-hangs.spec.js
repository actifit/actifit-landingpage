/**
 * Login buttons must never wait forever with no message.
 *
 * Two waits used to hang: reCAPTCHA on the /login page (no timeout there, unlike the
 * login modal), where Brave Shields or a privacy extension blocks it; and the Keychain
 * check on both login screens, which never settled when the extension was missing or
 * did not answer. Both looked like "nothing happens when I click".
 */
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import hive from '@hiveio/hive-js'
import LoginModal from '@/components/LoginModal.vue'
import LoginPage from '@/pages/login.vue'
import signedChallengeLogin from '@/mixins/signedChallengeLogin'

const methodsOf = (C) => (C.options ? C.options.methods : C.methods)
const mixin = signedChallengeLogin.methods

const POSTING_WIF = hive.auth.toWif('alice', 'posting-key-test', 'posting')
const NONCE = '3f9a'.repeat(16)
const CHALLENGE = { success: true, nonce: NONCE, message: 'Log in to actifit.io\nuser: alice\nnonce: ' + NONCE, expires_in: 120 }
const SESSION = { success: true, token: 'tok', userdata: { name: 'alice' } }
const ok = (body) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
const loginFetch = () => jest.fn().mockImplementation((url) => {
  const u = String(url)
  if (u.includes('loginChallenge')) return ok(CHALLENGE)
  if (u.includes('loginVerify')) return ok(SESSION)
  return ok({ success: true })
})

const makeVm = (over = {}) => {
  const vm = {
    error_proceeding: false,
    error_msg: '',
    captcha_invalid: '',
    login_in_progress: false,
    keychain_available: false,
    bchain_val: 'HIVE',
    keep_loggedin_val: false,
    $t: (k) => k,
    $store: { commit: jest.fn(), dispatch: jest.fn() },
    $refs: { username: { value: 'alice' }, ppkey: { value: POSTING_WIF } },
    setUserLoginStatus: jest.fn(),
    setKeychainLoginStatus: jest.fn(),
    ...over
  }
  Object.keys(mixin).forEach((k) => { if (!(k in over)) vm[k] = mixin[k].bind(vm) })
  return vm
}

afterEach(() => {
  jest.useRealTimers()
  delete window.hive_keychain
  delete global.fetch
  localStorage.clear()
})

describe('verifyKeychain', () => {
  it('is false at once when the extension is missing', async () => {
    const vm = makeVm({ keychain_available: true })
    await expect(vm.verifyKeychain()).resolves.toBe(false)
    expect(vm.keychain_available).toBe(false)
  })

  it('is true when Keychain answers the handshake', async () => {
    window.hive_keychain = { requestHandshake: (cb) => cb() }
    const vm = makeVm()
    await expect(vm.verifyKeychain()).resolves.toBe(true)
    expect(vm.keychain_available).toBe(true)
  })

  it('is false when the extension throws instead of answering', async () => {
    window.hive_keychain = { requestHandshake: () => { throw new Error('broken') } }
    await expect(makeVm().verifyKeychain()).resolves.toBe(false)
  })

  it('is false after 3s when Keychain never answers', async () => {
    jest.useFakeTimers()
    window.hive_keychain = { requestHandshake: () => {} }
    const p = makeVm().verifyKeychain()
    jest.advanceTimersByTime(3000)
    await expect(p).resolves.toBe(false)
  })
})

describe('loginCaptchaToken', () => {
  it('returns the token', async () => {
    const vm = makeVm({ $recaptchaLoaded: jest.fn().mockResolvedValue(), $recaptcha: jest.fn().mockResolvedValue('tkn') })
    await expect(vm.loginCaptchaToken()).resolves.toBe('tkn')
  })

  it('gives up after 8s when reCAPTCHA never answers', async () => {
    jest.useFakeTimers()
    const vm = makeVm({ $recaptchaLoaded: () => new Promise(() => {}) })
    const p = vm.loginCaptchaToken()
    jest.advanceTimersByTime(8000)
    await expect(p).resolves.toBe(null)
  })

  it('is null when reCAPTCHA is not there at all', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(makeVm().loginCaptchaToken()).resolves.toBe(null)
    console.warn.mockRestore()
  })
})

describe.each([['LoginModal', LoginModal], ['pages/login', LoginPage]])('%s', (name, C) => {
  it('the Keychain button says Keychain was not detected instead of doing nothing', async () => {
    const vm = makeVm()
    await methodsOf(C).loginKeychain.call(vm)
    expect(vm.error_proceeding).toBe(true)
    expect(vm.error_msg).toBe('keychain_not_detected')
    expect(vm.login_in_progress).toBe(false)
  })

  it('the Keychain button does nothing while another login is running', async () => {
    const vm = makeVm({ login_in_progress: true, verifyKeychain: jest.fn() })
    await methodsOf(C).loginKeychain.call(vm)
    expect(vm.verifyKeychain).not.toHaveBeenCalled()
    expect(vm.login_in_progress).toBe(true)
    expect(vm.error_msg).toBe('')
  })

  it('a rejected reCAPTCHA token still blocks the login and resets the button', async () => {
    global.fetch = jest.fn((url) => String(url).includes('verifyLoginCaptcha')
      ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ error: 1 }) })
      : ok(CHALLENGE))
    const vm = makeVm({ $recaptchaLoaded: jest.fn().mockResolvedValue(), $recaptcha: jest.fn().mockResolvedValue('t'), closeModal: jest.fn(), resetForm: jest.fn(), $emit: jest.fn() })
    await methodsOf(C).proceedLogin.call(vm)
    const called = global.fetch.mock.calls.map((c) => String(c[0]))
    expect(called.some((u) => u.includes('loginChallenge'))).toBe(false)
    expect(vm.login_in_progress).toBe(false)
    expect(vm.error_msg).toBe('login_error')
  })

  it('a posting-key login goes ahead without a reCAPTCHA token, and skips the token check', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    global.fetch = loginFetch()
    const vm = makeVm({ closeModal: jest.fn(), resetForm: jest.fn(), $emit: jest.fn() })
    await methodsOf(C).proceedLogin.call(vm)
    const called = global.fetch.mock.calls.map((c) => String(c[0]))
    expect(called.some((u) => u.includes('verifyLoginCaptcha'))).toBe(false)
    expect(called).toContain('/api/proxy/loginChallenge')
    expect(vm.setUserLoginStatus).toHaveBeenCalled()
    console.warn.mockRestore()
  })
})
