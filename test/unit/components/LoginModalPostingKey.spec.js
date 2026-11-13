/**
 * Posting-key login in the login modal: the session is written, and the key never
 * leaves the browser.
 *
 * Formerly LoginModalRecaptchaFallback.spec.js. Login no longer uses reCAPTCHA at all
 * (1.14.32), so the captcha-fallback cases went; login-no-recaptcha.spec.js covers that.
 * The cases kept here guard the signed-challenge flow: proceedLogin fetches a nonce from
 * /loginChallenge, signs the server's message locally, and sends only the signature to
 * /loginVerify.
 *
 * History worth keeping: setUserLoginStatus once dereferenced $recaptchaInstance before
 * writing any login state, so a browser without reCAPTCHA got an error instead of a
 * session. A fake vm here is never given a reCAPTCHA stub, so that cannot come back.
 */
import hive from '@hiveio/hive-js'
import LoginModal from '@/components/LoginModal.vue'
import signedChallengeLogin from '@/mixins/signedChallengeLogin'

// A real WIF: signBufferSha256 asserts on an invalid one, so a placeholder string
// would make every test here fail inside the signer rather than exercise the flow.
const POSTING_WIF = hive.auth.toWif('alice', 'posting-key-test', 'posting')

// The client now refuses to sign anything that is not exactly the login message, with
// a 64-hex nonce - so the fixture has to look like what the server really returns.
const NONCE = '3f9a'.repeat(16)
const CHALLENGE = {
  success: true,
  nonce: NONCE,
  message: 'Log in to actifit.io\nuser: alice\nnonce: ' + NONCE,
  expires_in: 120
}
const SESSION = { success: true, token: 'tok', userdata: { name: 'alice' } }

const ok = (body) => Promise.resolve({
  ok: true, status: 200, json: () => Promise.resolve(body)
})

// URL-aware, because the flow now makes two different calls that need different bodies.
// A blanket mock would hand /loginChallenge a session object with no nonce, and the
// login would fail for a reason that has nothing to do with the test.
const loginFetch = () => jest.fn().mockImplementation((url) => {
  const u = String(url)
  if (u.includes('loginChallenge')) return ok(CHALLENGE)
  if (u.includes('loginVerify')) return ok(SESSION)
  return ok({})
})

const makeVm = (overrides = {}) => {
  const vm = {
    is_logged_in: false,
    error_proceeding: false,
    error_msg: '',
    login_in_progress: false,
    bchain_val: 'HIVE',
    keep_loggedin_val: false,
    $store: { commit: jest.fn(), dispatch: jest.fn() },
    $refs: {
      username: { value: 'alice' },
      ppkey: { value: POSTING_WIF }
    },
    closeModal: jest.fn(),
    resetForm: jest.fn(),
    $emit: jest.fn(),
    $t: (key) => key,
    // The REAL success handler, not a stub. proceedLogin calls it as
    // this.setUserLoginStatus(...), so stubbing it would skip the exact code that
    // carried the original crash and this suite would pass while login stayed broken.
    captureSecurityNotice: LoginModal.methods.captureSecurityNotice,
    setUserLoginStatus: LoginModal.methods.setUserLoginStatus,
    ...overrides
  }
  // Vue merges mixin methods onto the instance; this vm is hand-built, so do the same
  // explicitly rather than silently calling undefined.
  Object.keys(signedChallengeLogin.methods).forEach((k) => {
    if (!(k in overrides)) vm[k] = signedChallengeLogin.methods[k].bind(vm)
  })
  return vm
}

describe('components/LoginModal.vue posting-key login', () => {
  afterEach(() => {
    localStorage.clear()
    delete global.fetch
  })

  describe('login state is persisted', () => {
    // These are the blocker. A TypeError here aborts the login AFTER the server has
    // already authenticated the user, so they see a generic error and stay logged out.
    it('setUserLoginStatus writes the session', () => {
      const vm = makeVm()

      expect(() => {
        LoginModal.methods.setUserLoginStatus.call(
          vm,
          { success: true, token: 'session-token', userdata: { name: 'alice' } },
          POSTING_WIF
        )
      }).not.toThrow()

      // The assertion that matters is not "no throw" but "the session was actually
      // written" - the original bug threw before this line was reached.
      expect(localStorage.getItem('access_token')).toBe('session-token')
      expect(localStorage.getItem('std_login_name')).toBe('alice')
      expect(vm.$emit).toHaveBeenCalledWith('login-successful')
    })

    it('setKeychainLoginStatus writes the session', () => {
      const vm = makeVm()

      expect(() => {
        LoginModal.methods.setKeychainLoginStatus.call(vm, {
          success: true,
          token: 'keychain-token',
          userdata: { name: 'bob' }
        })
      }).not.toThrow()

      expect(localStorage.getItem('access_token')).toBe('keychain-token')
      expect(localStorage.getItem('acti_login_method')).toBe('keychain')
      expect(vm.$emit).toHaveBeenCalledWith('login-successful')
    })
  })

  describe('proceedLogin', () => {
    it('reaches the login endpoints', async () => {
      const fetchMock = loginFetch()
      global.fetch = fetchMock
      const vm = makeVm()

      await LoginModal.methods.proceedLogin.call(vm)

      const called = fetchMock.mock.calls.map((c) => String(c[0]))
      expect(called).toContain('/api/proxy/loginChallenge')
      expect(called).toContain('/api/proxy/loginVerify')
      expect(called.some((u) => u.includes('verifyLoginCaptcha'))).toBe(false)
      expect(localStorage.getItem('access_token')).toBe('tok')
    })

    it('never sends the private posting key to any endpoint', async () => {
      // The point of the signed-challenge login: the key is used to sign in the browser
      // and must never cross the network. If someone later reintroduces a key-bearing
      // request, this fails.
      const fetchMock = loginFetch()
      global.fetch = fetchMock
      const vm = makeVm()

      await LoginModal.methods.proceedLogin.call(vm)

      const bodies = fetchMock.mock.calls
        .map((c) => (c[1] && c[1].body) || '')
        .join('\n')
      expect(bodies).not.toContain(POSTING_WIF)
      expect(bodies).not.toContain('ppkey')

      const verifyCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('loginVerify'))
      expect(JSON.parse(verifyCall[1].body)).toEqual({
        username: 'alice',
        nonce: NONCE,
        signature: expect.stringMatching(/^[0-9a-f]{130}$/),
        method: 'posting',
        keeploggedin: false
      })
    })

    it('signs the server message verbatim, not a locally rebuilt one', async () => {
      // Any difference in whitespace or line endings signs different bytes, and the
      // server reports that as a failed login rather than a mismatch - so the cause
      // would be invisible in production.
      const fetchMock = loginFetch()
      global.fetch = fetchMock
      const vm = makeVm()

      await LoginModal.methods.proceedLogin.call(vm)

      const verifyCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('loginVerify'))
      const { signature } = JSON.parse(verifyCall[1].body)
      const { Signature, hash, PublicKey } = require('@hiveio/hive-js/lib/auth/ecc')
      const pub = PublicKey.fromString(hive.auth.wifToPublic(POSTING_WIF))

      // Verifies against the server's exact bytes...
      expect(
        Signature.fromHex(signature).verifyHash(hash.sha256(CHALLENGE.message), pub)
      ).toBe(true)

      // ...and NOT against a plausibly-rebuilt variant. This is the half that catches a
      // future "helpful" reconstruction of the message client-side.
      const rebuilt = CHALLENGE.message.replace(/\n/g, '\r\n')
      expect(
        Signature.fromHex(signature).verifyHash(hash.sha256(rebuilt), pub)
      ).toBe(false)
    })

    it('does not call the login endpoints when the form is empty', async () => {
      const fetchMock = loginFetch()
      global.fetch = fetchMock
      const vm = makeVm({ $refs: { username: { value: '' }, ppkey: { value: '' } } })

      await LoginModal.methods.proceedLogin.call(vm)

      expect(fetchMock).not.toHaveBeenCalled()
      expect(vm.error_proceeding).toBe(true)
    })
  })
})
