/**
 * A server that is merely unavailable must not be reported as a bad password.
 *
 * During the incident, actifit-bot answered 503 on /loginKeychain. The 503 body carried
 * no `message`, so the client fell through to $t('login_error'):
 *     "Your account and/or private posting key is incorrect."
 *
 * That was false twice over. Keychain login involves no typed key at all, and the user's
 * key was fine — the endpoint was switched off. Telling the largest login cohort their
 * credentials are wrong, during an incident, drives exactly the wrong behaviour: people
 * resetting keys that do not need resetting, or assuming they were compromised.
 *
 * The flow has since moved to the signed-challenge login (/loginChallenge +
 * /loginVerify), so the endpoint named in the original bug no longer exists. The hazard
 * does: the contract defines 503 as "busy, try again". These tests keep the guarantee
 * attached to the CURRENT flow rather than retiring it with the old one.
 *
 * They drive the REAL loginKeychain on both entry points and assert on the message a user
 * would actually see.
 */
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import LoginModal from '@/components/LoginModal.vue'
import LoginPage from '@/pages/login.vue'
import signedChallengeLogin from '@/mixins/signedChallengeLogin'

const methodsOf = (C) => (C.options ? C.options.methods : C.methods)
const CASES = [['LoginModal', LoginModal], ['pages/login', LoginPage]]

const makeVm = () => {
  const vm = {
    error_proceeding: false,
    error_msg: '',
    login_in_progress: false,
    bchain_val: 'HIVE',
    keep_loggedin_val: false,
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
  }
  // Vue merges mixin methods onto the instance; these specs build the vm by hand, so
  // do the same explicitly rather than silently calling undefined.
  Object.keys(signedChallengeLogin.methods).forEach((k) => {
    vm[k] = signedChallengeLogin.methods[k].bind(vm)
  })
  return vm
}

const respond = (status, body) => {
  global.fetch = jest.fn(() => Promise.resolve({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }))
}

describe.each(CASES)('%s: a 503 from /loginChallenge', (_name, C) => {
  beforeEach(() => {
    // Keychain must look installed, or the method bails before the fetch.
    window.hive_keychain = { requestSignBuffer: jest.fn(), requestHandshake: jest.fn() }
  })
  afterEach(() => { delete global.fetch; delete window.hive_keychain })

  it('says the service is unavailable, not that the key is wrong', async () => {
    respond(503, { error: 'This feature is temporarily disabled for security maintenance.' })
    const vm = makeVm()

    await methodsOf(C).loginKeychain.call(vm)

    expect(vm.error_msg).toBe('login_service_unavailable')
    expect(vm.error_msg).not.toBe('login_error')
    expect(vm.error_proceeding).toBe(true)
    // The spinner must stop, or the button looks stuck.
    expect(vm.login_in_progress).toBe(false)
  })

  it('does not ask Keychain to sign anything when no challenge arrived', async () => {
    // No point prompting the user's extension for a nonce that never came.
    respond(503, { error: 'disabled' })
    const vm = makeVm()

    await methodsOf(C).loginKeychain.call(vm)

    expect(window.hive_keychain.requestSignBuffer).not.toHaveBeenCalled()
  })

  it('never calls the retired Keychain endpoints', async () => {
    // /loginKeychain and /loginKeychainVerify stay disabled: their challenge was
    // forgeable by anyone holding the server's static secret.
    respond(503, { error: 'disabled' })
    const vm = makeVm()

    await methodsOf(C).loginKeychain.call(vm)

    const urls = global.fetch.mock.calls.map((c) => String(c[0]))
    expect(urls.some((u) => u.includes('loginKeychainVerify'))).toBe(false)
    expect(urls.some((u) => u.endsWith('/loginKeychain'))).toBe(false)
    expect(urls.some((u) => u.includes('loginChallenge'))).toBe(true)
  })
})
