jest.mock('@hiveio/hive-js', () => ({ auth: { wifToPublic: jest.fn() } }))
jest.mock('@/utils/keyChecks', () => Object.assign({}, jest.requireActual('@/utils/keyChecks'), {
  classifyKey: jest.fn()
}))

import { shallowMount } from '@vue/test-utils'
import KeyPromptModal from '~/components/KeyPromptModal.vue'
import { requestKey, describeOperations } from '~/utils/keyPrompt'
import { classifyKey, keyRefusal } from '~/utils/keyChecks'

describe('keyRefusal - the one rule for every typed key', () => {
  it.each([
    ['owner', 'active', 'key_prompt_owner_refused'],
    ['owner', 'posting', 'key_prompt_owner_refused'],
    ['active', 'posting', 'posting_key_only_login'],
    // used to be ACCEPTED: a posting key at the active prompt
    ['posting', 'active', 'key_prompt_not_active'],
    ['none', 'active', 'key_prompt_not_active'],
    ['none', 'posting', 'key_prompt_not_posting'],
    ['invalid', 'posting', 'key_prompt_invalid'],
    // used to fail OPEN - and a posting prompt then kept the unchecked key in memory
    ['unknown', 'posting', 'key_prompt_check_failed'],
    ['unknown', 'active', 'key_prompt_check_failed'],
    ['active', 'active', null],
    ['posting', 'posting', null]
  ])('%s key for a %s operation -> %s', (kind, requested, expected) => {
    expect(keyRefusal(kind, requested)).toBe(expected)
  })
})

describe('describeOperations', () => {
  it('spells out a transfer, so the user can check amount, recipient and memo', () => {
    expect(describeOperations([['transfer', { amount: '1.000 HIVE', to: 'actifit.market', memo: 'buy-gadget:p1' }]]))
      .toEqual(['transfer 1.000 HIVE -> @actifit.market (memo: buy-gadget:p1)'])
  })
  it('describes votes, posts and custom_json, and tolerates junk', () => {
    expect(describeOperations([
      ['vote', { weight: 5000, author: 'bob', permlink: 'p' }],
      ['comment', { author: 'alice', permlink: 'x' }],
      ['custom_json', { id: 'actifit', json: '{"a":1}' }],
      ['claim_reward_balance', {}]
    ])).toEqual(['vote 50% on @bob/p', 'publish @alice/x', 'custom_json actifit: {"a":1}', 'claim_reward_balance'])
    expect(describeOperations(null)).toEqual([])
  })
})

describe('KeyPromptModal', () => {
  const flush = () => new Promise((r) => setTimeout(r, 0))
  const mountIt = () => shallowMount(KeyPromptModal, { mocks: { $t: (k) => k } })

  it('shows what is being signed, as TEXT (memos are user-controlled)', async () => {
    const wrapper = mountIt()
    requestKey('active', 'alice', [['transfer', { amount: '1.000 HIVE', to: 'x', memo: '<b>hi</b>' }]])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.key-prompt-ops').text()).toContain('memo: <b>hi</b>')
    expect(wrapper.find('.key-prompt-ops b').exists()).toBe(false)
    wrapper.destroy()
  })

  it('refuses a posting key at the active prompt and does not resolve', async () => {
    const wrapper = mountIt()
    const answer = jest.fn()
    requestKey('active', 'alice', []).then(answer)
    await wrapper.vm.$nextTick()
    classifyKey.mockResolvedValue('posting')
    wrapper.setData({ wif: '5Kposting' })
    await wrapper.vm.submit()
    await flush()
    expect(wrapper.vm.error).toBe('key_prompt_not_active')
    expect(answer).not.toHaveBeenCalled()
    wrapper.destroy()
  })

  it('refuses when the account lookup fails, instead of accepting an unchecked key', async () => {
    const wrapper = mountIt()
    const answer = jest.fn()
    requestKey('posting', 'alice', []).then(answer)
    await wrapper.vm.$nextTick()
    classifyKey.mockResolvedValue('unknown')
    wrapper.setData({ wif: '5Kwhatever' })
    await wrapper.vm.submit()
    await flush()
    expect(wrapper.vm.error).toBe('key_prompt_check_failed')
    expect(answer).not.toHaveBeenCalled()
    wrapper.destroy()
  })

  it('hands back a verified key', async () => {
    const wrapper = mountIt()
    const p = requestKey('active', 'alice', [])
    await wrapper.vm.$nextTick()
    classifyKey.mockResolvedValue('active')
    wrapper.setData({ wif: ' 5Kactive ' })
    await wrapper.vm.submit()
    await expect(p).resolves.toBe('5Kactive')
    wrapper.destroy()
  })
})
