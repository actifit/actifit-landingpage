import { shallowMount } from '@vue/test-utils'
import Transaction from '@/components/Transaction.vue'

function mountTransaction (transaction) {
  return shallowMount(Transaction, {
    propsData: { transaction },
    mocks: {
      $t: (k) => k,
      $getTimeDifference: () => 'just now',
      $safeUrl: (u) => u
    }
  })
}

describe('components/Transaction.vue', () => {
  describe('decideColor', () => {
    it('returns "positive" for a zero or positive amount', () => {
      const wrapper = mountTransaction({ token_count: 10, date: '2024-01-01T00:00:00' })
      expect(wrapper.vm.decideColor(10)).toBe('positive')
      expect(wrapper.vm.decideColor(0)).toBe('positive')
    })

    it('returns "negative" for a negative amount', () => {
      const wrapper = mountTransaction({ token_count: -3, date: '2024-01-01T00:00:00' })
      expect(wrapper.vm.decideColor(-3)).toBe('negative')
    })
  })

  describe('date computed', () => {
    it('formats as D/M/YYYY - H:MM with a zero-padded minute', () => {
      const raw = '2024-03-05T08:07:00'
      const wrapper = mountTransaction({ token_count: 1, date: raw })

      // Mirror the component's local-time formatting to stay timezone-safe.
      const d = new Date(raw)
      const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
      const expected = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} - ${d.getHours()}:${mm}`

      expect(wrapper.vm.date).toBe(expected)
      // sanity: the minute is zero-padded
      expect(wrapper.vm.date).toMatch(/:0\d$/)
    })
  })
})
