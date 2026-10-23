/**
 * A disabled Keychain endpoint must not be reported as a bad password.
 *
 * actifit-bot's incident containment (#137) answers 503 on /loginKeychain and
 * /loginKeychainVerify. The 503 body carries no `message`, so the client's
 * `if (contt.message)` check failed and execution fell through to $t('login_error'):
 *     "Your account and/or private posting key is incorrect."
 *
 * That is false twice over. Keychain login involves no typed key at all, and the user's
 * key is fine — the endpoint is switched off. Telling the largest login cohort their
 * credentials are wrong, during an incident, drives exactly the wrong behaviour: people
 * resetting keys that do not need resetting, or assuming their account is compromised.
 *
 * These tests drive the REAL loginKeychain on both entry points with a 503, and assert on
 * the message a user would actually see.
 */
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import LoginModal from '@/components/LoginModal.vue'
import LoginPage from '@/pages/login.vue'

const methodsOf = (C) => (C.options ? C.options.methods : C.methods)
const CASES = [['LoginModal', LoginModal], ['pages/login', LoginPage]]

const makeVm = () => ({
  error_proceeding: false,
  error_msg: '',
  login_in_progress: false,
  bchain_val: 'HIVE',
  // loginKeychain returns early on !keychain_available, so without this the method
  // bails before the fetch and every assertion below passes vacuously on an empty
  // error_msg — which is how the first run of this spec looked green-adjacent.
  keychain_available: true,
  $t: (k) => k,
  $store: { commit: jest.fn(), dispatch: jest.fn() },
  $refs: { username: { value: 'alice' } },
  setKeychainLoginStatus: jest.fn(),
  postLoginRedirect: jest.fn(),
  verifyKeychain: jest.fn(),
})

const respond = (status, body) => {
  global.fetch = jest.fn(() => Promise.resolve({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }))
}

describe.each(CASES)('%s: a 503 from /loginKeychain', (_name, C) => {
  beforeEach(() => {
    // Keychain must look installed, or the method bails before the fetch.
    window.hive_keychain = { requestVerifyKey: jest.fn(), requestHandshake: jest.fn() }
  })
  afterEach(() => { delete global.fetch; delete window.hive_keychain })

  it('says the method is unavailable, not that the key is wrong', async () => {
    respond(503, { error: 'This feature is temporarily disabled for security maintenance.' })
    const vm = makeVm()

    await methodsOf(C).loginKeychain.call(vm)

    expect(vm.error_msg).toBe('keychain_login_unavailable')
    expect(vm.error_msg).not.toBe('login_error')
    expect(vm.error_proceeding).toBe(true)
    // The spinner must stop, or the button looks stuck.
    expect(vm.login_in_progress).toBe(false)
  })

  it('does not ask Keychain to sign anything when the endpoint is off', async () => {
    // No point prompting the user's extension for a challenge that never arrived.
    respond(503, { error: 'disabled' })
    const vm = makeVm()

    await methodsOf(C).loginKeychain.call(vm)

    expect(window.hive_keychain.requestVerifyKey).not.toHaveBeenCalled()
  })

  it('still shows the generic error for an ordinary failure', async () => {
    // A 200 with no challenge is a real failure and must keep its existing message,
    // or every genuine problem becomes "temporarily unavailable".
    respond(200, { error: 'no such account' })
    const vm = makeVm()

    await methodsOf(C).loginKeychain.call(vm)

    expect(vm.error_msg).toBe('login_error')
  })

  it('proceeds normally when a challenge IS returned', async () => {
    // Guards the re-enable path: once the 503 lifts, this must not be swallowed.
    respond(200, { message: '#encrypted-challenge' })
    const vm = makeVm()

    await methodsOf(C).loginKeychain.call(vm)

    expect(window.hive_keychain.requestVerifyKey).toHaveBeenCalled()
    expect(vm.error_msg).not.toBe('keychain_login_unavailable')
  })
})
