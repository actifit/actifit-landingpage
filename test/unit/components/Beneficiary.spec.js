import { shallowMount } from '@vue/test-utils'
import Beneficiary from '@/components/Beneficiary.vue'

// Shared mounting options: i18n $t passthrough.
function mountBeneficiary (props = {}) {
  return shallowMount(Beneficiary, {
    propsData: props,
    mocks: { $t: (key) => key }
  })
}

describe('components/Beneficiary.vue', () => {
  let alertSpy
  beforeEach(() => { alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {}) })
  afterEach(() => { alertSpy.mockRestore() })

  describe('initialization', () => {
    it('scales initialEntries weights down by 100 into local state', () => {
      const wrapper = mountBeneficiary({ initialEntries: [{ account: 'alice', weight: 500 }] })
      expect(wrapper.vm.entries).toEqual([{ account: 'alice', weight: 5 }])
    })

    it('starts with the modal closed', () => {
      const wrapper = mountBeneficiary()
      expect(wrapper.vm.isModalOpen).toBe(false)
    })
  })

  describe('computed totals', () => {
    it('totalValue sums entry weights plus restrictedPercent', () => {
      const wrapper = mountBeneficiary({
        initialEntries: [{ account: 'a', weight: 1000 }, { account: 'b', weight: 2000 }],
        restrictedPercent: 5
      })
      // 10 + 20 + 5
      expect(wrapper.vm.totalValue).toBe(35)
    })

    it('remainingValue is 100 minus totalValue', () => {
      const wrapper = mountBeneficiary({ initialEntries: [{ account: 'a', weight: 3000 }] })
      expect(wrapper.vm.remainingValue).toBe(70)
    })

    it('formattedEntries scales weights back up by 100', () => {
      const wrapper = mountBeneficiary({ initialEntries: [{ account: 'a', weight: 2500 }] })
      expect(wrapper.vm.formattedEntries).toEqual([{ account: 'a', weight: 2500 }])
    })
  })

  describe('addEntry', () => {
    it('adds a valid entry and keeps the list alphabetically sorted', () => {
      const wrapper = mountBeneficiary({ initialEntries: [{ account: 'mike', weight: 1000 }] })
      wrapper.vm.newEntry = { account: 'alice', weight: 10 }
      wrapper.vm.addEntry()

      expect(wrapper.vm.entries.map(e => e.account)).toEqual(['alice', 'mike'])
      // input fields are reset after a successful add
      expect(wrapper.vm.newEntry.account).toBe('')
    })

    it('rejects an entry that would push the total over 100%', () => {
      const wrapper = mountBeneficiary({ initialEntries: [{ account: 'a', weight: 9000 }] })
      wrapper.vm.newEntry = { account: 'bob', weight: 20 }
      wrapper.vm.addEntry()

      expect(alertSpy).toHaveBeenCalledWith('The total weight cannot exceed 100%')
      expect(wrapper.vm.entries.find(e => e.account === 'bob')).toBeUndefined()
    })

    it('alerts when a field is missing', () => {
      const wrapper = mountBeneficiary()
      wrapper.vm.newEntry = { account: '', weight: 10 }
      wrapper.vm.addEntry()
      expect(alertSpy).toHaveBeenCalledWith('Please fill in both fields')
    })
  })

  describe('removal rules', () => {
    it('isRemovable is false for accounts listed in requiredEntries', () => {
      const wrapper = mountBeneficiary({
        initialEntries: [{ account: 'locked', weight: 1000 }],
        requiredEntries: ['locked']
      })
      expect(wrapper.vm.isRemovable(0)).toBe(false)
    })

    it('isRemovable is true for non-required accounts', () => {
      const wrapper = mountBeneficiary({ initialEntries: [{ account: 'free', weight: 1000 }] })
      expect(wrapper.vm.isRemovable(0)).toBe(true)
    })

    it('removeEntry does nothing for a required (locked) account', () => {
      const wrapper = mountBeneficiary({
        initialEntries: [{ account: 'locked', weight: 1000 }],
        requiredEntries: ['locked']
      })
      wrapper.vm.removeEntry(0)
      expect(wrapper.vm.entries).toHaveLength(1)
    })

    it('removeEntry removes a non-required account', () => {
      const wrapper = mountBeneficiary({ initialEntries: [{ account: 'free', weight: 1000 }] })
      wrapper.vm.removeEntry(0)
      expect(wrapper.vm.entries).toHaveLength(0)
    })
  })

  describe('modal open/close', () => {
    it('openModal then closeModal toggles isModalOpen', async () => {
      const wrapper = mountBeneficiary()
      wrapper.vm.openModal()
      expect(wrapper.vm.isModalOpen).toBe(true)
      wrapper.vm.closeModal()
      expect(wrapper.vm.isModalOpen).toBe(false)
    })
  })
})
