// Heavy chain libs imported at module top — stub them so the component loads.
jest.mock('steem', () => ({ api: { setOptions: jest.fn() } }))
jest.mock('dsteem', () => ({ Client: jest.fn() }))

import { shallowMount } from '@vue/test-utils'
import VotingStatus from '@/components/VotingStatus.vue'

function mountVotingStatus () {
  return shallowMount(VotingStatus, {
    propsData: { user: { account: { name: 'alice' } }, minView: false },
    mocks: { $t: (key) => key }
  })
}

describe('components/VotingStatus.vue', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    // mounted() fires loadVotingStatus(); keep fetch from being a real network call
    global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(null) })
  })
  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    delete global.fetch
  })

  describe('setVotingStatus', () => {
    it('reflects an active voting round', () => {
      const wrapper = mountVotingStatus()
      wrapper.vm.setVotingStatus({ status: { is_voting: true }, vp: 87.654321, reward_start: '01:02:03' })

      expect(wrapper.vm.isVoting).toBe(true)
      expect(wrapper.vm.vp).toBe(87.654321)
      expect(wrapper.vm.vpPercent).toBe('87.654%') // toFixed(3) + '%'
      // while voting, the reward-start timer shows the current voting timer
      expect(wrapper.vm.rewardStartTimer).toBe(wrapper.vm.currentVotingTimer)
      expect(wrapper.vm.isLoading).toBe(false)
    })

    it('shows the next reward start time when not currently voting', () => {
      const wrapper = mountVotingStatus()
      wrapper.vm.setVotingStatus({ status: { is_voting: false }, vp: 50, reward_start: '05:30:00' })

      expect(wrapper.vm.isVoting).toBe(false)
      expect(wrapper.vm.rewardStartTimer).toBe('05:30:00')
      expect(wrapper.vm.vpPercent).toBe('50.000%')
    })

    it('ignores malformed payloads (no status) and stays in loading state', () => {
      const wrapper = mountVotingStatus()
      const wasLoading = wrapper.vm.isLoading
      wrapper.vm.setVotingStatus({})
      expect(wrapper.vm.isLoading).toBe(wasLoading)
    })
  })

  describe('displayProperColor (unused dead code)', () => {
    // NOTE: displayProperColor and getVotingPower are defined here but are NOT
    // referenced in this component's template — they appear to be leftovers from
    // the component this was derived from (see SteemStats.vue / VoteModal.vue,
    // which define currentVotingPower and actually render these). Because nothing
    // renders them here, this has no user-visible effect. This test just pins the
    // current behavior; it can be deleted if the dead computeds are removed.
    it('falls back to the danger color since currentVotingPower is undefined here', () => {
      const wrapper = mountVotingStatus()
      expect(wrapper.vm.displayProperColor).toBe('color: #dc3545')
    })
  })
})
