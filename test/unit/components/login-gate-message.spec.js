/**
 * A gated login must tell the user the truth about why they were refused.
 *
 * actifit-bot's /loginAuth gate (actifit-bot#144) answers, for an account caught in the
 * 2026-10-21 incident:
 *     403 { success:false, code:'KEY_ROTATION_REQUIRED', message:'...change your Hive posting key...' }
 * and, when it cannot read the chain to decide:
 *     503 { success:false, code:'TRY_AGAIN', message:'...' }
 *
 * Both previously fell through to $t('login_error') — "Your account and/or private
 * posting key is incorrect." That is wrong in a way that actively misdirects: the user's
 * key IS correct, and the message sends them to RE-ENTER or reset it when what they must
 * actually do is ROTATE it on chain. During an incident, the one group being refused is
 * the group we most need to give accurate instructions to.
 *
 * These tests call the REAL setUserLoginStatus on both login entry points and assert on
 * the error_msg a user would see.
 */
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import LoginModal from '@/components/LoginModal.vue'
import LoginPage from '@/pages/login.vue'

const COMPONENTS = [
  ['LoginModal', LoginModal],
  ['pages/login', LoginPage],
]

const methodsOf = (Comp) => (Comp.options ? Comp.options.methods : Comp.methods)

const makeVm = (Comp) => ({
  error_proceeding: false,
  error_msg: '',
  login_in_progress: true,
  is_logged_in: false,
  $store: { commit: jest.fn(), dispatch: jest.fn() },
  $t: (k) => k,
  closeModal: jest.fn(),
  resetForm: jest.fn(),
  postLoginRedirect: jest.fn(),
  $emit: jest.fn(),
  // The method under test calls this helper on itself.
  loginGateMessage: methodsOf(Comp).loginGateMessage,
})

const refuse = (Comp, json) => {
  const vm = makeVm(Comp)
  methodsOf(Comp).setUserLoginStatus.call(vm, json, '5Kposting')
  return vm
}

describe.each(COMPONENTS)('%s shows the gate reason, not "wrong password"', (_name, Comp) => {
  const GATE_MSG = 'For your security, please change your Hive posting key, then log in again.'

  it('surfaces the KEY_ROTATION_REQUIRED message', () => {
    const vm = refuse(Comp, { success: false, code: 'KEY_ROTATION_REQUIRED', message: GATE_MSG })

    expect(vm.error_msg).toBe(GATE_MSG)
    expect(vm.error_msg).not.toBe('login_error')
    expect(vm.error_proceeding).toBe(true)
    expect(vm.login_in_progress).toBe(false)
  })

  it('surfaces the TRY_AGAIN message', () => {
    const msg = 'We could not verify your account right now. Please try again shortly.'
    expect(refuse(Comp, { success: false, code: 'TRY_AGAIN', message: msg }).error_msg).toBe(msg)
  })

  it('still shows the generic error for an ordinary wrong password', () => {
    // The gate must not swallow the normal failure, or every bad password becomes
    // "change your key".
    expect(refuse(Comp, { success: false }).error_msg).toBe('login_error')
  })

  it.each([
    ['an unknown code', { success: false, code: 'SOMETHING_ELSE', message: 'internal detail' }],
    ['a known code with no message', { success: false, code: 'KEY_ROTATION_REQUIRED' }],
    ['a known code with a blank message', { success: false, code: 'KEY_ROTATION_REQUIRED', message: '   ' }],
    ['a message but no code', { success: false, message: 'Mongo connection refused at 10.1.2.3' }],
  ])('falls back to the generic error for %s', (_label, json) => {
    // The allow-list exists so unexpected server or proxy errors are not echoed into the
    // UI — note the last case, an internal error that must not reach a user.
    expect(refuse(Comp, json).error_msg).toBe('login_error')
  })

  it('does not treat a gate response as a successful login', () => {
    const vm = refuse(Comp, { success: false, code: 'KEY_ROTATION_REQUIRED', message: GATE_MSG })
    expect(vm.is_logged_in).toBeFalsy()
    expect(vm.$store.commit).not.toHaveBeenCalledWith('setStdLoginUser', true)
  })
})
