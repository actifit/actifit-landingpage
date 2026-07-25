import LoginModal from '@/components/LoginModal.vue'

describe('components/LoginModal.vue posting-key chat session', () => {
  afterEach(() => localStorage.clear())

  it('stores the validated posting key in Vuex memory after standard login', () => {
    const store = { commit: jest.fn(), dispatch: jest.fn() }
    const vm = {
      is_logged_in: false,
      $recaptchaInstance: { hideBadge: jest.fn() },
      $store: store,
      closeModal: jest.fn(),
      resetForm: jest.fn(),
      $emit: jest.fn(),
      $t: (key) => key
    }
    const response = {
      success: true,
      token: 'session-token',
      userdata: { name: 'alice' }
    }

    LoginModal.methods.setUserLoginStatus.call(vm, response, '5Kposting')

    expect(store.commit).toHaveBeenCalledWith('setChatPostingKey', '5Kposting')
    expect(localStorage.getItem('acti_login_method')).toBe('')
    const storedValues = Array.from(
      { length: localStorage.length },
      (_, index) => localStorage.getItem(localStorage.key(index))
    )
    expect(storedValues).not.toContain('5Kposting')
  })
})
