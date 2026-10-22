/**
 * Regression guard for login when reCAPTCHA is unavailable.
 *
 * Context: reCAPTCHA registers on every page (NavbarBrand pulls in LoginModal), and in
 * a browser that blocks or cannot run it, BOTH `$recaptcha` and `$recaptchaInstance`
 * are undefined - the plugin assigns them only inside the loader's .then(). Login must
 * still complete, because the captcha token is never sent to loginAuth and so never
 * gated it server-side.
 *
 * This file exists because the first attempt at that fallback shipped with a full green
 * suite and still did not work: `setUserLoginStatus` dereferenced `$recaptchaInstance`
 * BEFORE writing any login state, so the exact browser the fallback was for got an
 * error instead of a session. The one existing LoginModal test passes
 * `$recaptchaInstance: { hideBadge: jest.fn() }`, which hid it.
 *
 * So the rule these tests encode: a fake vm here must NEVER be given a reCAPTCHA stub.
 * Absence is the case under test.
 */
import LoginModal from '@/components/LoginModal.vue'

const makeVm = (overrides = {}) => ({
  // These tests are about the reCAPTCHA fallback, not the posting-key kill switch, so
  // the switch is ON here - otherwise proceedLogin short-circuits and the captcha logic
  // below is never reached, which would silently gut this suite rather than fail it.
  // Keeping the coverage alive also means it still guards the behaviour if posting-key
  // login is ever re-enabled. The switch's own behaviour is covered separately at the
  // bottom of this file.
  posting_key_login_enabled: true,
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
    ppkey: { value: '5Kposting' }
  },
  closeModal: jest.fn(),
  resetForm: jest.fn(),
  $emit: jest.fn(),
  $t: (key) => key,
  // The REAL success handler, not a stub. proceedLogin calls it as
  // this.setUserLoginStatus(...), so stubbing it would skip the exact code that
  // carried the original crash and this suite would pass while login stayed broken.
  setUserLoginStatus: LoginModal.methods.setUserLoginStatus,
  ...overrides
})

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
          '5Kposting'
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
      global.fetch = jest.fn().mockImplementation((url) => {
        if (String(url).includes('verifyLoginCaptcha')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, token: 'tok', userdata: { name: 'alice' } })
        })
      })

      await LoginModal.methods.proceedLogin.call(vm)

      expect(vm.$recaptchaLoaded).toHaveBeenCalled()
      expect(recaptcha).toHaveBeenCalledWith('login')
      const called = global.fetch.mock.calls.map((c) => String(c[0]))
      expect(called.some((u) => u.includes('verifyLoginCaptcha'))).toBe(true)
      expect(localStorage.getItem('access_token')).toBe('tok')
    })

    it('reaches loginAuth when $recaptcha is undefined', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, token: 'tok', userdata: { name: 'alice' } })
      })
      global.fetch = fetchMock
      const vm = makeVm()

      await LoginModal.methods.proceedLogin.call(vm)

      const called = fetchMock.mock.calls.map((c) => c[0])
      expect(called).toContain('/api/proxy/loginAuth')
      // Nothing was sent to verification, because no token could be obtained.
      expect(called.some((u) => String(u).includes('verifyLoginCaptcha'))).toBe(false)
      expect(localStorage.getItem('access_token')).toBe('tok')
    })

    it('never puts the captcha token in the loginAuth body', async () => {
      // This is the premise the whole fallback rests on. If someone later binds the
      // token to loginAuth, this test fails and the fallback must be reconsidered,
      // because a client can force token=null by blocking Google.
      const fetchMock = jest.fn().mockImplementation((url) => {
        if (String(url).includes('verifyLoginCaptcha')) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, token: 'tok', userdata: { name: 'alice' } })
        })
      })
      global.fetch = fetchMock
      const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('good-token') })

      await LoginModal.methods.proceedLogin.call(vm)

      const authCall = fetchMock.mock.calls.find((c) => c[0] === '/api/proxy/loginAuth')
      expect(JSON.parse(authCall[1].body)).toEqual({
        username: 'alice',
        ppkey: '5Kposting',
        bchain: 'HIVE',
        keeploggedin: false
      })
    })

    it('still blocks a token that IS obtained and then rejected', async () => {
      // The deliberate asymmetry: only the INABILITY to get a token is tolerated.
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: 'invalid captcha' })
      })
      global.fetch = fetchMock
      const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('bad-token') })

      await LoginModal.methods.proceedLogin.call(vm)

      expect(vm.error_proceeding).toBe(true)
      expect(vm.login_in_progress).toBe(false)
      expect(fetchMock.mock.calls.map((c) => c[0])).not.toContain('/api/proxy/loginAuth')
    })

    it('survives a non-JSON response from the verify endpoint', async () => {
      // An upstream 502 returns HTML; .json() throws. Unhandled, that left the button
      // dead with no message - the same failure this change exists to remove.
      const fetchMock = jest.fn().mockImplementation((url) => {
        if (String(url).includes('verifyLoginCaptcha')) {
          return Promise.resolve({ ok: false, json: () => Promise.reject(new SyntaxError('Unexpected token <')) })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, token: 'tok', userdata: { name: 'alice' } })
        })
      })
      global.fetch = fetchMock
      const vm = makeVm({ $recaptcha: jest.fn().mockResolvedValue('good-token') })

      await expect(LoginModal.methods.proceedLogin.call(vm)).resolves.toBeUndefined()
      expect(localStorage.getItem('access_token')).toBe('tok')
    })

    it('shows the spinner before awaiting reCAPTCHA, not after', async () => {
      // The wait can last up to 8s. If the flag is set after it, the button looks dead
      // for that whole window and a second click fires a second parallel loginAuth.
      let progressDuringRecaptcha = null
      const vm = makeVm({
        $recaptcha: jest.fn().mockImplementation(() => {
          progressDuringRecaptcha = vm.login_in_progress
          return Promise.resolve(null)
        })
      })
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, token: 'tok', userdata: { name: 'alice' } })
      })

      await LoginModal.methods.proceedLogin.call(vm)

      expect(progressDuringRecaptcha).toBe(true)
    })

    it('does not call loginAuth when the form is empty', async () => {
      const fetchMock = jest.fn()
      global.fetch = fetchMock
      const vm = makeVm({ $refs: { username: { value: '' }, ppkey: { value: '' } } })

      await LoginModal.methods.proceedLogin.call(vm)

      expect(fetchMock).not.toHaveBeenCalled()
      expect(vm.error_proceeding).toBe(true)
    })
  })

  describe('the shipped flag value', () => {
    // Without these, flipping the flag back to true in either file leaves the whole
    // suite green - i.e. the control could be silently removed. The flag is hand
    // duplicated across two components and the proxy, so drift is the likely regression.
    it('posting-key login is DISABLED in the login modal as shipped', () => {
      expect(LoginModal.data().posting_key_login_enabled).toBe(false)
    })

    it('posting-key login is DISABLED on the standalone /login page as shipped', () => {
      // eslint-disable-next-line global-require
      const LoginPage = require('@/pages/login.vue').default
      expect(LoginPage.data().posting_key_login_enabled).toBe(false)
    })

    it('the proxy refuses /loginAuth too - the UI is not the control', () => {
      // The enforcement point. curl, the mobile app and a stale bundle all bypass the
      // components entirely and hit this endpoint directly.
      const src = require('fs').readFileSync(
        require('path').join(__dirname, '..', '..', '..', 'api', 'proxy.js'), 'utf8')
      expect(src).toMatch(/const POSTING_KEY_LOGIN_ENABLED = false/)
      expect(src).toMatch(/path === '\/loginAuth' && !POSTING_KEY_LOGIN_ENABLED/)
    })
  })

  describe('resetForm with the ppkey input unrendered', () => {
    // The guard this covers is the fix's entire answer to "does Keychain still work?",
    // and it had ZERO coverage: every test stubbed resetForm with jest.fn(), so deleting
    // the guard left the suite green. In production the throw lands inside
    // setKeychainLoginStatus AFTER closeModal() and the localStorage writes but BEFORE
    // refreshUser/fetchModerators/$emit - modal shuts, token stored, navbar never
    // updates. Exactly the failure mode this file's header was written about.
    it('does not throw when $refs.ppkey is absent', () => {
      expect(() => LoginModal.methods.resetForm.call({
        $refs: { username: { value: 'alice' } }
      })).not.toThrow()
    })

    it('a Keychain login runs the REAL resetForm and still completes', () => {
      const vm = makeVm({
        posting_key_login_enabled: false,
        $refs: { username: { value: 'alice' } },
        resetForm: LoginModal.methods.resetForm
      })

      LoginModal.methods.setKeychainLoginStatus.call(vm, {
        success: true, token: 'tok', userdata: { name: 'alice' }
      })

      // These three run AFTER resetForm, so they are what a throw would swallow.
      expect(vm.$emit).toHaveBeenCalledWith('login-successful')
      expect(vm.$store.dispatch).toHaveBeenCalledWith('steemconnect/refreshUser')
      expect(vm.$store.dispatch).toHaveBeenCalledWith('fetchModerators')
    })
  })

  describe('posting-key login kill switch', () => {
    // Added 2026-10-21 when posting-key login was disabled as a precaution after a
    // report of Hive-Engine transfers on accounts that did not authorise them.
    // proceedLogin is the ONLY place the raw key would be put on the wire, so the
    // guard belongs in the method, not just in the template.
    it('refuses to POST anything when the switch is off', async () => {
      const fetchSpy = jest.fn()
      global.fetch = fetchSpy
      const vm = makeVm({ posting_key_login_enabled: false })

      await LoginModal.methods.proceedLogin.call(vm)

      // The assertion that matters: no request at all. Checking only the error message
      // would pass against an implementation that showed the message AND still sent
      // the key.
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(vm.error_proceeding).toBe(true)
      expect(vm.login_in_progress).toBe(false)
      expect(vm.error_msg).toBe('posting_key_login_disabled')
    })

    it('does not depend on the ppkey ref existing', async () => {
      // With the switch off the input is not rendered, so $refs.ppkey is undefined.
      // An unguarded dereference here would throw instead of refusing cleanly.
      const fetchSpy = jest.fn()
      global.fetch = fetchSpy
      const vm = makeVm({
        posting_key_login_enabled: false,
        $refs: { username: { value: 'alice' } }
      })

      await expect(LoginModal.methods.proceedLogin.call(vm)).resolves.toBeUndefined()
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })
})
