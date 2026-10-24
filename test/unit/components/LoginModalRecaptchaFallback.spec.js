/**
 * Regression guard for login when reCAPTCHA is unavailable.
 *
 * Context: reCAPTCHA registers on every page (NavbarBrand pulls in LoginModal), and in
 * a browser that blocks or cannot run it, BOTH `$recaptcha` and `$recaptchaInstance`
 * are undefined - the plugin assigns them only inside the loader's .then(). Login must
 * still complete, because the captcha token is never sent to the login endpoints and so
 * never gated them server-side.
 *
 * This file exists because the first attempt at that fallback shipped with a full green
 * suite and still did not work: `setUserLoginStatus` dereferenced `$recaptchaInstance`
 * BEFORE writing any login state, so the exact browser the fallback was for got an
 * error instead of a session. The one existing LoginModal test passes
 * `$recaptchaInstance: { hideBadge: jest.fn() }`, which hid it.
 *
 * So the rule these tests encode: a fake vm here must NEVER be given a reCAPTCHA stub.
 * Absence is the case under test.
 *
 * UPDATED for the signed-challenge login: proceedLogin no longer POSTs the key to
 * /loginAuth. It fetches a nonce from /loginChallenge, signs the server's message
 * locally, and sends only the signature to /loginVerify. The captcha premise is
 * unchanged, and there is now a stronger assertion available - that the private key
 * appears in NO request body at all.
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
const loginFetch = (opts = {}) => jest.fn().mockImplementation((url) => {
  const u = String(url)
  if (u.includes('verifyLoginCaptcha')) {
    return opts.captcha ? opts.captcha() : ok({ success: true })
  }
  if (u.includes('loginChallenge')) return ok(CHALLENGE)
  if (u.includes('loginVerify')) return ok(SESSION)
  return ok({})
})

const makeVm = (overrides = {}) => {
  const vm = {
    is_logged_in: false,
    error_proceeding: false,
    error_msg: '',
    captcha_invalid: '',
    login_in_progress: false,
    bchain_val: 'HIVE',
    keep_loggedin_val: false,
    // Deliberately no $recaptcha and no $recaptchaInstance.
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

describe('components/LoginModal.vue reCAPTCHA-unavailable fallback', () => {
  afterEach(() => {
    localStorage.clear()
    delete global.fetch
  })

  describe('login state is persisted even with no reCAPTCHA instance', () => {
    // These are the blocker. A TypeError here aborts the login AFTER the server has
    // already authenticated the user, so they see a generic error and stay logged out.
    it('setUserLoginStatus completes without $recaptchaInstance', () => {
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

    it('setKeychainLoginStatus completes without $recaptchaInstance', () => {
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
    it('waits for the loader before giving up on a token', async () => {
      // A merely-slow script must not cause a silent skip: $recaptcha is undefined
      // until the loader resolves, so an early click would otherwise bypass the
      // captcha entirely even though it was about to become available.
      const recaptcha = jest.fn().mockResolvedValue('late-token')
      const vm = makeVm({
        $recaptchaLoaded: jest.fn().mockImplementation(() => {
          // Only now does the plugin assign $recaptcha, as it does in the real loader.
          vm.$recaptcha = recaptcha
          return Promise.resolve()
        })
      })
      global.fetch = loginFetch()

      await LoginModal.methods.proceedLogin.call(vm)

      expect(vm.$recaptchaLoaded).toHaveBeenCalled()
      expect(recaptcha).toHaveBeenCalledWith('login')
      const called = global.fetch.mock.calls.map((c) => String(c[0]))
      expect(called.some((u) => u.includes('verifyLoginCaptcha'))).toBe(true)
      expect(localStorage.getItem('access_token')).toBe('tok')
    })

    it('reaches the login endpoints when $recaptcha is undefined', async () => {
      const fetchMock = loginFetch()
      global.fetch = fetchMock
      const vm = makeVm()

      await LoginModal.methods.proceedLogin.call(vm)

      const called = fetchMock.mock.calls.map((c) => String(c[0]))
      expect(called).toContain('/api/proxy/loginChallenge')
      expect(called).toContain('/api/proxy/loginVerify')
      // Nothing was sent to verification, because no token could be obtained.
      expect(called.some((u) => u.includes('verifyLoginCaptcha'))).toBe(false)
      expect(localStorage.getItem('access_token')).toBe('tok')
    })

    it('never sends the private posting key, or the captcha token, to any endpoint', async () => {
      // Two premises in one assertion.
      //
      // The KEY one is the point of the signed-challenge login: the key is used to sign
      // in the browser and must never cross the network. If someone later reintroduces
      // a key-bearing request, this fails.
      //
      // The CAPTCHA one is what the whole fallback rests on: a client can force
      // token=null by blocking Google, so if the token were ever bound to login it
      // would become bypassable and the fallback would need reconsidering.
      const fetchMock = loginFetch()
      global.fetch = fetchMock
      const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('good-token') })

      await LoginModal.methods.proceedLogin.call(vm)

      const bodies = fetchMock.mock.calls
        .map((c) => (c[1] && c[1].body) || '')
        .join('\n')
      expect(bodies).not.toContain(POSTING_WIF)
      expect(bodies).not.toContain('good-token')
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

    it('still blocks a token that IS obtained and then rejected', async () => {
      // The deliberate asymmetry: only the INABILITY to get a token is tolerated.
      const fetchMock = loginFetch({ captcha: () => ok({ error: 'invalid captcha' }) })
      global.fetch = fetchMock
      const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('bad-token') })

      await LoginModal.methods.proceedLogin.call(vm)

      expect(vm.error_proceeding).toBe(true)
      expect(vm.login_in_progress).toBe(false)
      const called = fetchMock.mock.calls.map((c) => String(c[0]))
      expect(called).not.toContain('/api/proxy/loginChallenge')
      expect(called).not.toContain('/api/proxy/loginVerify')
    })

    it('survives a non-JSON response from the verify endpoint', async () => {
      // An upstream 502 returns HTML; .json() throws. Unhandled, that left the button
      // dead with no message - the same failure this change exists to remove.
      const fetchMock = loginFetch({
        captcha: () => Promise.resolve({
          ok: false,
          status: 502,
          json: () => Promise.reject(new SyntaxError('Unexpected token <'))
        })
      })
      global.fetch = fetchMock
      const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('good-token') })

      await expect(LoginModal.methods.proceedLogin.call(vm)).resolves.toBeUndefined()
      expect(localStorage.getItem('access_token')).toBe('tok')
    })

    it('shows the spinner before awaiting reCAPTCHA, not after', async () => {
      // The wait can last up to 8s. If the flag is set after it, the button looks dead
      // for that whole window and a second click fires a second parallel login.
      let progressDuringRecaptcha = null
      const vm = makeVm({
        $recaptcha: jest.fn().mockImplementation(() => {
          progressDuringRecaptcha = vm.login_in_progress
          return Promise.resolve(null)
        })
      })
      global.fetch = loginFetch()

      await LoginModal.methods.proceedLogin.call(vm)

      expect(progressDuringRecaptcha).toBe(true)
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
