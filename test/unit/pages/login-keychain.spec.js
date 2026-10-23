/**
 * Guards for /login's Keychain and HiveAuth paths.
 *
 * These existed as bugs for months and nobody noticed, because the posting-key field on
 * the same page gave users a third way in. Disabling posting-key login removes that
 * cover, so both of these go from latent to "the page is dead":
 *
 *  1. setKeychainLoginStatus gated on `json.HIVE` and read `acct_data = json.HIVE`. Since
 *     009ce64 (2026-06-04) it is fed the /loginKeychainVerify response, which carries
 *     `userdata`. components/LoginModal.vue was updated at the time; this page was not.
 *     Keychain login here therefore failed for EVERY user.
 *  2. Both success paths called `this.$recaptchaInstance.hideBadge()` unguarded. The
 *     plugin assigns $recaptchaInstance only inside the loader's .then(), so when
 *     reCAPTCHA is blocked (Brave Shields, uBlock, corporate DNS) it is undefined and the
 *     call threw - ABOVE every localStorage write and the redirect. The user was
 *     authenticated upstream and still ended up with a generic error and no session.
 *
 * The vm fakes here deliberately provide NO $recaptchaInstance. Absence is the case under
 * test; stubbing it is what hid this.
 */
const LoginPage = require('@/pages/login.vue').default

const makeVm = (overrides = {}) => ({
  error_proceeding: false,
  error_msg: '',
  login_in_progress: false,
  is_logged_in: false,
  // Deliberately no $recaptchaInstance.
  $store: { commit: jest.fn(), dispatch: jest.fn() },
  $t: (k) => k,
  postLoginRedirect: jest.fn(),
  ...overrides
})

// The shape /loginKeychainVerify actually returns.
const VERIFY_RESPONSE = {
  success: true,
  token: 'jwt-token',
  userdata: { name: 'alice' }
}

describe('pages/login.vue — Keychain login', () => {
  afterEach(() => localStorage.clear())

  it('accepts the /loginKeychainVerify response shape (userdata, not HIVE)', () => {
    const vm = makeVm()

    LoginPage.methods.setKeychainLoginStatus.call(vm, VERIFY_RESPONSE)

    // Session actually persisted - the assertion that would have caught the original bug.
    expect(localStorage.getItem('std_login_name')).toBe('alice')
    expect(localStorage.getItem('access_token')).toBe('jwt-token')
    expect(localStorage.getItem('acti_login_method')).toBe('keychain')
    expect(vm.error_proceeding).toBe(false)
    expect(vm.postLoginRedirect).toHaveBeenCalled()
  })

  it('completes with NO $recaptchaInstance present', () => {
    // The reCAPTCHA-blocked population. Before the fix this threw before any write.
    const vm = makeVm()

    expect(() => LoginPage.methods.setKeychainLoginStatus.call(vm, VERIFY_RESPONSE)).not.toThrow()
    expect(localStorage.getItem('std_login_name')).toBe('alice')
  })

  it('still rejects a genuinely failed verification', () => {
    // Without this, "accept everything" would satisfy the tests above.
    const vm = makeVm()

    LoginPage.methods.setKeychainLoginStatus.call(vm, { success: false })

    expect(vm.error_proceeding).toBe(true)
    expect(vm.error_msg).toBe('login_error')
    expect(localStorage.getItem('std_login_name')).toBeNull()
    expect(vm.postLoginRedirect).not.toHaveBeenCalled()
  })

  it('does not accept the OLD {HIVE: ...} shape as a successful login', () => {
    // Pins the direction of the fix: if someone "restores" json.HIVE, this fails rather
    // than silently reintroducing a handler that matches a shape nothing sends.
    const vm = makeVm()

    LoginPage.methods.setKeychainLoginStatus.call(vm, { success: true, token: 't', HIVE: { name: 'alice' } })

    expect(localStorage.getItem('std_login_name')).toBeNull()
    expect(vm.error_proceeding).toBe(true)
  })
})
