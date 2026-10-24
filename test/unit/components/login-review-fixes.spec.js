/**
 * Regression guards for the five issues two independent reviews found in the
 * signed-challenge login (PR #501). Every one of them passed the existing suite, because
 * nothing exercised it - so each now has a test that fails if it comes back.
 *
 *   1. pages/login.vue's Keychain handler required json.HIVE; /loginVerify returns
 *      json.userdata. Keychain login on /login failed for every user.
 *   2. The expired-nonce check compared body.error to 'Login request expired'. The server
 *      sends body.message, with a suffix. It never matched.
 *   3. The mixin threw on a network drop / abort / non-JSON body, and the Keychain and
 *      HiveAuth callers had no try/catch, so the spinner turned forever.
 *   4. The client signed WHATEVER message the API returned, silently, with the typed key -
 *      making a compromised API a signing oracle.
 *   5. Users already logged in via HiveAuth kept their HAS token under access_token, so
 *      their broadcasts would hang forever after deploy.
 */
import LoginPage from '@/pages/login.vue'
import signedChallengeLogin from '@/mixins/signedChallengeLogin'
import migrateHiveauthToken from '@/plugins/hiveauth-token-migration'

const USER = 'alice'
const NONCE = 'c0de'.repeat(16)
const GOOD = {
  success: true,
  nonce: NONCE,
  message: 'Log in to actifit.io\nuser: ' + USER + '\nnonce: ' + NONCE,
  expires_in: 120
}

const makeVm = (extra = {}) => {
  const vm = {
    error_proceeding: false, error_msg: '', login_in_progress: true,
    keep_loggedin_val: false, $t: (k) => k, ...extra
  }
  Object.keys(signedChallengeLogin.methods).forEach((k) => {
    vm[k] = signedChallengeLogin.methods[k].bind(vm)
  })
  return vm
}

const reply = (status, body) => Promise.resolve({
  ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body)
})

afterEach(() => { delete global.fetch; localStorage.clear() })

describe('1. pages/login.vue Keychain success uses userdata', () => {
  it('logs the user in on the real /loginVerify response shape', () => {
    const vm = {
      is_logged_in: false, error_proceeding: false, error_msg: '', login_in_progress: true,
      $t: (k) => k,
      $store: { commit: jest.fn() },
      captureSecurityNotice: jest.fn(),
      postLoginRedirect: jest.fn()
    }
    // exactly what completeLogin sends - note: NO `HIVE` key
    const json = { success: true, token: 'jwt-1', userdata: { name: USER } }

    LoginPage.methods.setKeychainLoginStatus.call(vm, json)

    expect(vm.error_proceeding).toBe(false)
    expect(localStorage.getItem('access_token')).toBe('jwt-1')
    expect(localStorage.getItem('acti_login_method')).toBe('keychain')
    expect(vm.postLoginRedirect).toHaveBeenCalled()
    // Keychain users can be flagged too, so the notice must be captured here as well
    expect(vm.captureSecurityNotice).toHaveBeenCalledWith(json)
  })
})

describe('2. an expired nonce is reported as expired, not as a bad key', () => {
  it('matches the server\'s real 403 body', async () => {
    global.fetch = jest.fn(() => reply(403,
      { success: false, message: 'Login request expired. Please try again.' }))
    const vm = makeVm()

    await expect(vm.submitLoginVerify(USER, NONCE, 'ab'.repeat(65), 'keychain'))
      .resolves.toBeNull()

    expect(vm.error_msg).toBe('login_request_expired')
    expect(vm.error_msg).not.toBe('login_error')
  })

  it('still reports a genuine signature failure as a login error', async () => {
    global.fetch = jest.fn(() => reply(403, { success: false, message: 'Login failed' }))
    const vm = makeVm()

    await vm.submitLoginVerify(USER, NONCE, 'ab'.repeat(65), 'keychain')
    expect(vm.error_msg).toBe('login_error')
  })
})

describe('3. network failures never leave the spinner turning', () => {
  const failures = [
    ['a dropped connection', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['the 20s abort', () => Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))],
    ['a non-JSON body', () => Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('<html>')) })]
  ]

  failures.forEach(([label, failingFetch]) => {
    it('requestLoginChallenge survives ' + label, async () => {
      global.fetch = jest.fn(failingFetch)
      const vm = makeVm()

      await expect(vm.requestLoginChallenge(USER)).resolves.toBeNull()
      expect(vm.login_in_progress).toBe(false)
      expect(vm.error_proceeding).toBe(true)
    })

    it('submitLoginVerify survives ' + label, async () => {
      global.fetch = jest.fn(failingFetch)
      const vm = makeVm()

      await expect(vm.submitLoginVerify(USER, NONCE, 'ab'.repeat(65), 'hiveauth'))
        .resolves.toBeNull()
      expect(vm.login_in_progress).toBe(false)
      expect(vm.error_proceeding).toBe(true)
    })
  })

  it('a dropped connection is not reported as a wrong key', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    const vm = makeVm()

    await vm.requestLoginChallenge(USER)
    expect(vm.error_msg).toBe('login_service_unavailable')
  })
})

describe('4. the client refuses to sign anything but our login message', () => {
  const signFn = jest.fn(() => 'ab'.repeat(65))
  beforeEach(() => signFn.mockClear())

  it('signs the genuine challenge', async () => {
    global.fetch = jest.fn((url) => String(url).includes('loginChallenge')
      ? reply(200, GOOD)
      : reply(200, { success: true, token: 't', userdata: { name: USER } }))
    const vm = makeVm()

    await vm.signedChallengeLogin(USER, 'posting', signFn)
    expect(signFn).toHaveBeenCalledWith(GOOD.message)
  })

  const hostile = [
    ['another site\'s login challenge', { ...GOOD, message: 'Sign in to evil.example\nnonce: ' + NONCE }],
    ['our message for a DIFFERENT user', { ...GOOD, message: 'Log in to actifit.io\nuser: victim\nnonce: ' + NONCE }],
    ['a message with extra text appended', { ...GOOD, message: GOOD.message + '\nand also this' }],
    ['a non-hex nonce', { ...GOOD, nonce: 'z'.repeat(64), message: 'Log in to actifit.io\nuser: ' + USER + '\nnonce: ' + 'z'.repeat(64) }],
    ['a short nonce', { ...GOOD, nonce: 'abc', message: 'Log in to actifit.io\nuser: ' + USER + '\nnonce: abc' }]
  ]

  hostile.forEach(([label, body]) => {
    it('refuses ' + label + ' - and never calls the signer', async () => {
      global.fetch = jest.fn(() => reply(200, body))
      const vm = makeVm()

      await expect(vm.signedChallengeLogin(USER, 'posting', signFn)).resolves.toBeNull()
      // The point: on the typed-key path there is no wallet prompt, so the signer being
      // reached at all is the vulnerability.
      expect(signFn).not.toHaveBeenCalled()
      expect(vm.error_proceeding).toBe(true)
    })
  })
})

describe('5. existing HiveAuth sessions keep their broadcasts working', () => {
  it('moves a legacy HAS token out of access_token', () => {
    localStorage.setItem('acti_login_method', 'hiveauth')
    localStorage.setItem('access_token', 'legacy-has-token')

    migrateHiveauthToken()

    expect(localStorage.getItem('hiveauth_has_token')).toBe('legacy-has-token')
    // it was a HAS token being sent to our API as a bearer credential; it goes
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('leaves a post-change HiveAuth session alone', () => {
    localStorage.setItem('acti_login_method', 'hiveauth')
    localStorage.setItem('access_token', 'api-jwt')
    localStorage.setItem('hiveauth_has_token', 'has-token')

    migrateHiveauthToken()

    expect(localStorage.getItem('access_token')).toBe('api-jwt')
    expect(localStorage.getItem('hiveauth_has_token')).toBe('has-token')
  })

  it('never touches a Keychain or typed-key session', () => {
    ['keychain', ''].forEach((method) => {
      localStorage.clear()
      localStorage.setItem('acti_login_method', method)
      localStorage.setItem('access_token', 'api-jwt')

      migrateHiveauthToken()

      expect(localStorage.getItem('access_token')).toBe('api-jwt')
      expect(localStorage.getItem('hiveauth_has_token')).toBeNull()
    })
  })

  it('is idempotent', () => {
    localStorage.setItem('acti_login_method', 'hiveauth')
    localStorage.setItem('access_token', 'legacy-has-token')

    migrateHiveauthToken()
    migrateHiveauthToken()

    expect(localStorage.getItem('hiveauth_has_token')).toBe('legacy-has-token')
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})
