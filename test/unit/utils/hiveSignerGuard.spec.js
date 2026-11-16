import { opBlocked, keychainCallBlocked, guardKeychain, guardHiveAuth } from '~/utils/hiveSignerGuard'

const storage = (chain) => ({ getItem: (k) => (k === 'cur_bchain' ? chain : null) })

describe('which operations would land on Hive by mistake', () => {
  it.each([
    ['vote', {}], ['comment', {}], ['comment_options', {}], ['delete_comment', {}],
    ['withdraw_vesting', { vesting_shares: '1.000000 VESTS' }], ['delegate_vesting_shares', {}],
    ['claim_reward_balance', {}], ['account_witness_vote', {}], ['account_witness_proxy', {}],
    ['transfer', { amount: '1.000 BLURT' }], ['transfer_to_vesting', { amount: '5.000 BLURT' }],
    ['transfer_to_savings', { amount: '1.000 STEEM' }],
    // the profile page reads the Blurt profile on Blurt: signing it on Hive would replace the Hive profile
    ['account_update2', { account: 'alice', posting_json_metadata: '{}' }], ['account_update', {}],
    ['cancel_transfer_from_savings', {}],
    ['account_witness_vote', { witness: 'someoneelse', approve: true }],
  ])('%s %j is refused', (name, params) => {
    expect(opBlocked([name, params])).toBe(true)
  })

  it.each([
    // Hive-Engine / Actifit actions and buying products are Hive's, whatever chain is picked
    ['custom_json', { id: 'ssc-mainnet-hive', json: '{}' }],
    ['custom_json', { id: 'actifit', json: '{}' }],
    ['transfer', { amount: '10.000 HIVE' }], ['transfer', { amount: '2.500 HBD' }],
    ['update_proposal_votes', {}],
    // the Actifit witness card is a Hive action for every login method (typed keys sign it on Hive)
    ['account_witness_vote', { account: 'alice', witness: 'actifit', approve: true }],
    ['account_witness_proxy', { account: 'alice', proxy: 'actifit' }],
  ])('%s %j goes through', (name, params) => {
    expect(opBlocked([name, params])).toBe(false)
  })

  it('Keychain requests: by kind, and transfers by their currency argument', () => {
    expect(keychainCallBlocked('requestPost', [])).toBe(true)
    expect(keychainCallBlocked('requestPowerUp', [])).toBe(true)
    expect(keychainCallBlocked('requestDelegation', [])).toBe(true)
    expect(keychainCallBlocked('requestTransfer', ['a', 'b', '1.000', 'memo', 'BLURT'])).toBe(true)
    expect(keychainCallBlocked('requestTransfer', ['a', 'b', '1.000', 'memo', 'HIVE'])).toBe(false)
    expect(keychainCallBlocked('requestBroadcast', ['a', [['custom_json', {}], ['vote', {}]], 'Posting'])).toBe(true)
    expect(keychainCallBlocked('requestBroadcast', ['a', [['custom_json', {}]], 'Posting'])).toBe(false)
    expect(keychainCallBlocked('requestSignBuffer', [])).toBe(false)
    expect(keychainCallBlocked('requestCustomJson', [])).toBe(false)
    expect(keychainCallBlocked('requestUpdateProposalVote', [])).toBe(false)
    expect(keychainCallBlocked('requestWitnessVote', ['alice', 'actifit', true])).toBe(false)
    expect(keychainCallBlocked('requestProxy', ['alice', 'actifit'])).toBe(false)
    expect(keychainCallBlocked('requestWitnessVote', ['alice', 'other', true])).toBe(true)
  })

  it('operations passed as a JSON string are checked too', () => {
    expect(keychainCallBlocked('requestBroadcast', ['a', JSON.stringify([['vote', {}]]), 'Posting'])).toBe(true)
    expect(keychainCallBlocked('requestBroadcast', ['a', JSON.stringify([['custom_json', {}]]), 'Posting'])).toBe(false)
    expect(keychainCallBlocked('requestBroadcast', ['a', 'not json', 'Posting'])).toBe(true)
  })
})

describe('Keychain', () => {
  const keychain = () => ({
    requestBroadcast: jest.fn(), requestPost: jest.fn(), requestTransfer: jest.fn(),
    requestCustomJson: jest.fn(), requestSignBuffer: jest.fn(),
  })

  it('with Blurt selected, a vote is refused, Keychain is not opened, and the caller hears back', async () => {
    const kc = keychain()
    const original = kc.requestBroadcast
    const refuse = jest.fn(() => 'msg')
    guardKeychain(kc, storage('BLURT'), refuse)
    const callback = jest.fn()
    kc.requestBroadcast('alice', [['vote', { author: 'bob', permlink: 'p', weight: 10000 }]], 'Posting', callback)
    await new Promise((r) => setTimeout(r, 0))
    expect(original).not.toHaveBeenCalled()
    expect(refuse).toHaveBeenCalledWith('BLURT')
    expect(callback).toHaveBeenCalledWith({ success: false, error: 'chain_not_supported', message: 'msg', result: {} })
  })

  it('with Blurt selected, Hive-only actions still reach Keychain', () => {
    const kc = keychain()
    const { requestBroadcast, requestTransfer, requestCustomJson, requestSignBuffer } = kc
    guardKeychain(kc, storage('BLURT'), jest.fn())
    kc.requestBroadcast('alice', [['custom_json', { id: 'ssc-mainnet-hive' }]], 'Active', () => {})
    kc.requestTransfer('alice', 'shop', '10.000', 'order', 'HIVE', () => {})
    kc.requestCustomJson('alice', 'actifit', 'Posting', '{}', 'x', () => {})
    kc.requestSignBuffer('alice', 'challenge', 'Posting', () => {})
    expect(requestBroadcast).toHaveBeenCalledTimes(1)
    expect(requestTransfer).toHaveBeenCalledTimes(1)
    expect(requestCustomJson).toHaveBeenCalledTimes(1)
    expect(requestSignBuffer).toHaveBeenCalledTimes(1)
  })

  it('with Hive selected (or nothing saved) everything goes through unchanged', () => {
    for (const chain of ['HIVE', null]) {
      const kc = keychain()
      const { requestPost } = kc
      const refuse = jest.fn()
      guardKeychain(kc, storage(chain), refuse)
      kc.requestPost('alice', 't', 'b', 'p', '', '{}', 'perm', '', () => {})
      expect(requestPost).toHaveBeenCalledTimes(1)
      expect(refuse).not.toHaveBeenCalled()
    }
  })

  it('reads the chain at call time, so switching chain needs no reload', () => {
    let chain = 'HIVE'
    const kc = keychain()
    const { requestPost } = kc
    guardKeychain(kc, { getItem: () => chain }, () => 'msg')
    kc.requestPost('alice', 't', 'b', 'p', '', '{}', 'perm', '', () => {})
    chain = 'BLURT'
    kc.requestPost('alice', 't', 'b', 'p', '', '{}', 'perm', '', () => {})
    expect(requestPost).toHaveBeenCalledTimes(1)
  })

  it('a frozen Keychain object does not throw (the site must still start)', () => {
    const kc = Object.freeze({ requestBroadcast: jest.fn() })
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => guardKeychain(kc, storage('BLURT'), jest.fn())).not.toThrow()
  })

  it('wraps only once, and leaves a missing Keychain alone', () => {
    const kc = keychain()
    expect(guardKeychain(kc, storage('BLURT'), jest.fn())).toBe(true)
    expect(guardKeychain(kc, storage('BLURT'), jest.fn())).toBe(false)
    expect(guardKeychain(undefined, storage('BLURT'), jest.fn())).toBe(false)
  })
})

describe('HiveAuth', () => {
  it('with Blurt selected, a post is refused without opening the app, as a failed signing', async () => {
    const original = jest.fn(() => Promise.resolve({ cmd: 'sign_ack', data: 'tx' }))
    const HAS = { broadcast: original }
    guardHiveAuth(HAS, storage('BLURT'), () => 'msg')
    const res = await HAS.broadcast({}, 'posting', [['comment', {}], ['comment_options', {}]], () => {})
    expect(original).not.toHaveBeenCalled()
    expect(res).toEqual({ cmd: 'sign_nack', error: 'chain_not_supported', message: 'msg' })
  })

  it('Hive-only operations, and anything on Hive, still go to the app', async () => {
    const original = jest.fn(() => Promise.resolve({ cmd: 'sign_ack', data: 'tx' }))
    const HAS = { broadcast: original }
    let chain = 'BLURT'
    guardHiveAuth(HAS, { getItem: () => chain }, jest.fn())
    await HAS.broadcast({}, 'active', [['custom_json', { id: 'ssc-mainnet-hive' }]], () => {})
    chain = 'HIVE'
    await HAS.broadcast({}, 'posting', [['vote', {}]], () => {})
    expect(original).toHaveBeenCalledTimes(2)
  })
})
