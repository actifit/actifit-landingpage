const mockGetHiveRCMana = jest.fn()
const mockGetSteemRCMana = jest.fn()

jest.mock('steem', () => ({ api: { setOptions: jest.fn() } }))
jest.mock('@hiveio/hive-js', () => ({ config: { set: jest.fn() }, api: { setOptions: jest.fn() } }))
jest.mock('dsteem', () => ({ Client: jest.fn(() => ({ rc: { getRCMana: mockGetSteemRCMana } })) }))
jest.mock('@hiveio/dhive', () => ({
  Client: jest.fn(() => ({ rc: { getRCMana: mockGetHiveRCMana } }))
}))

import { shallowMount } from '@vue/test-utils'
import SteemStats from '@/components/SteemStats.vue'

function userWithPower (name, percentage) {
  return {
    account: {
      name,
      vesting_shares: '100.000000 VESTS',
      received_vesting_shares: '0.000000 VESTS',
      delegated_vesting_shares: '0.000000 VESTS',
      vesting_withdraw_rate: '0.000000 VESTS',
      voting_manabar: {
        current_mana: String(percentage * 1000000),
        last_update_time: Math.floor(Date.now() / 1000)
      }
    }
  }
}

async function flushPromises () {
  await Promise.resolve()
  await Promise.resolve()
}

describe('components/SteemStats user changes', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockGetHiveRCMana.mockReset()
	localStorage.setItem('cur_bchain', 'HIVE')
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
	localStorage.removeItem('cur_bchain')
  })

  it('refreshes VP and RC when the logged-in user changes', async () => {
    mockGetHiveRCMana.mockImplementation((username) => Promise.resolve({
      percentage: username === 'alice' ? 2500 : 7500
    }))
    const wrapper = shallowMount(SteemStats, {
      propsData: { user: userWithPower('alice', 25), minView: false },
      mocks: { $t: key => key }
    })
    await flushPromises()

    await wrapper.setProps({ user: userWithPower('bob', 80) })
    await flushPromises()

    expect(mockGetHiveRCMana).toHaveBeenLastCalledWith('bob')
    expect(wrapper.vm.currentVotingPower).toBeCloseTo(80)
    expect(wrapper.vm.currentRC).toBe(75)
    expect(wrapper.vm.currentRCPercent).toBe('75.00%')
    wrapper.destroy()
  })

  it('ignores an RC response belonging to the previous user', async () => {
    let resolveAlice
    mockGetHiveRCMana.mockImplementation((username) => {
      if (username === 'alice') {
        return new Promise((resolve) => { resolveAlice = resolve })
      }
      return Promise.resolve({ percentage: 6000 })
    })
    const wrapper = shallowMount(SteemStats, {
      propsData: { user: userWithPower('alice', 25), minView: false },
      mocks: { $t: key => key }
    })

    await wrapper.setProps({ user: userWithPower('bob', 80) })
    await flushPromises()
    resolveAlice({ percentage: 10000 })
    await flushPromises()

    expect(wrapper.vm.currentVotingPower).toBeCloseTo(80)
    expect(wrapper.vm.currentRC).toBe(60)
    expect(wrapper.vm.currentRCPercent).toBe('60.00%')
    wrapper.destroy()
  })

  it('keeps the newest RC response when refreshes overlap for one user', async () => {
    let resolveFirst
    mockGetHiveRCMana
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce({ percentage: 8000 })
    const wrapper = shallowMount(SteemStats, {
      propsData: { user: userWithPower('alice', 50), minView: false },
      mocks: { $t: key => key }
    })

    await wrapper.vm.fetchVotingPower()
    expect(wrapper.vm.currentRC).toBe(80)
    resolveFirst({ percentage: 2000 })
    await flushPromises()

    expect(wrapper.vm.currentRC).toBe(80)
    expect(wrapper.vm.currentRCPercent).toBe('80.00%')
    wrapper.destroy()
  })

  it('uses the newly selected chain when the account changes', async () => {
    mockGetHiveRCMana.mockResolvedValue({ percentage: 2500 })
    mockGetSteemRCMana.mockResolvedValue({ percentage: 6500 })
    const wrapper = shallowMount(SteemStats, {
      propsData: { user: userWithPower('alice', 25), minView: false },
      mocks: { $t: key => key }
    })
    await flushPromises()

    localStorage.setItem('cur_bchain', 'STEEM')
    await wrapper.setProps({ user: userWithPower('bob', 75) })
    await flushPromises()

    expect(mockGetSteemRCMana).toHaveBeenCalledWith('bob')
    expect(wrapper.vm.currentRC).toBe(65)
    wrapper.destroy()
  })

  it('clears VP and RC on logout and ignores the signed-out user response', async () => {
    let resolveAlice
    mockGetHiveRCMana.mockImplementation(() => new Promise((resolve) => { resolveAlice = resolve }))
    const wrapper = shallowMount(SteemStats, {
      propsData: { user: userWithPower('alice', 25), minView: false },
      mocks: { $t: key => key }
    })

    await wrapper.setProps({ user: null })
    expect(wrapper.vm.currentVotingPower).toBe(0)
    expect(wrapper.vm.currentRC).toBe(0)
    expect(wrapper.vm.currentRCPercent).toBe('0%')

    resolveAlice({ percentage: 10000 })
    await flushPromises()
    expect(wrapper.vm.currentRC).toBe(0)
    expect(wrapper.vm.currentRCPercent).toBe('0%')
    wrapper.destroy()
  })

  it('stops polling when the component is destroyed', () => {
    mockGetHiveRCMana.mockResolvedValue({ percentage: 5000 })
    const wrapper = shallowMount(SteemStats, {
      propsData: { user: userWithPower('alice', 50), minView: false },
      mocks: { $t: key => key }
    })

    expect(jest.getTimerCount()).toBe(1)
    wrapper.destroy()
    expect(jest.getTimerCount()).toBe(0)
  })
})
