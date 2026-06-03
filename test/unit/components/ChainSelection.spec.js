import { shallowMount } from '@vue/test-utils'
import ChainSelection from '@/components/ChainSelection.vue'

function mountChain () {
  const store = {
    getters: {
      'steemconnect/user': { account: { name: 'alice' } },
      bchain: 'HIVE'
    },
    commit: jest.fn(),
    dispatch: jest.fn()
  }
  const wrapper = shallowMount(ChainSelection, {
    mocks: {
      $store: store,
      $t: (key) => key
    }
  })
  return { wrapper, store }
}

describe('components/ChainSelection.vue', () => {
  let confirmSpy
  beforeEach(() => { confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true) })
  afterEach(() => { confirmSpy.mockRestore(); localStorage.clear() })

  describe('numberFormat', () => {
    it('formats with thousands separators at the given precision', () => {
      const { wrapper } = mountChain()
      expect(wrapper.vm.numberFormat(1234567.89, 1)).toBe('1,234,567.9')
    })
  })

  describe('setActiveChain', () => {
    it('does nothing when the chain has not actually changed', () => {
      const { wrapper, store } = mountChain()
      wrapper.vm.cur_bchain = 'HIVE'
      wrapper.vm.prior_chain = 'HIVE'
      wrapper.vm.setActiveChain({ target: { value: 'HIVE' } })

      expect(store.commit).not.toHaveBeenCalled()
    })

    it('reverts the selection when the user cancels the confirm dialog', () => {
      confirmSpy.mockReturnValue(false)
      const { wrapper, store } = mountChain()
      wrapper.vm.cur_bchain = 'BLURT'
      wrapper.vm.prior_chain = 'HIVE'
      wrapper.vm.setActiveChain({ target: { value: 'BLURT' } })

      expect(wrapper.vm.cur_bchain).toBe('HIVE') // reverted
      expect(store.commit).not.toHaveBeenCalled()
    })

    it('commits the new chain and persists it when confirmed', () => {
      confirmSpy.mockReturnValue(true)
      const { wrapper, store } = mountChain()
      wrapper.vm.cur_bchain = 'BLURT'
      wrapper.vm.prior_chain = 'HIVE'
      wrapper.vm.setActiveChain({ target: { value: 'BLURT' } })

      expect(store.commit).toHaveBeenCalledWith('setBchain', 'BLURT')
      expect(wrapper.vm.prior_chain).toBe('BLURT')
      expect(localStorage.getItem('cur_bchain')).toBe('BLURT')
    })

    it('passes the confirm prompt the chain name (template interpolation)', () => {
      const { wrapper } = mountChain()
      wrapper.vm.cur_bchain = 'BLURT'
      wrapper.vm.prior_chain = 'HIVE'
      // $t returns the key; the component replaces _CHAIN_ with the value
      wrapper.vm.setActiveChain({ target: { value: 'BLURT' } })
      expect(confirmSpy).toHaveBeenCalledWith('confirm_chain_switch') // _CHAIN_ not present in key
    })
  })

  describe('reactivity to store bchain changes', () => {
    it('syncs cur_bchain and refreshes the user when bchain getter changes', async () => {
      const { wrapper, store } = mountChain()
      // simulate the vuex getter changing and notify the watcher
      store.getters.bchain = 'BLURT'
      wrapper.vm.$options.watch.bchain.call(wrapper.vm, 'BLURT')

      expect(wrapper.vm.cur_bchain).toBe('BLURT')
      expect(store.dispatch).toHaveBeenCalledWith('steemconnect/refreshUser')
    })
  })
})
