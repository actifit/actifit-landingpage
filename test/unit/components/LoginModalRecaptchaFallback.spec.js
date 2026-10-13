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
})
