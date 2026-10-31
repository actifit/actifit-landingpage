import Comp from '~/components/FriendshipModal.vue'

// Exercise methods against a mocked `this`, per repo convention.
// Regression focus: propagateFriendReq once referenced an undefined `req_res`
// (the fetch call was missing entirely), so every add-friend threw a
// ReferenceError before the DB propagation ever ran. These tests lock in that
// the fetch happens and the correct endpoint is chosen per login method.

const OLD_ENV = process.env.actiAppUrl

const ctx = (over = {}) => ({
  user: { account: { name: 'alice' } },
  cur_bchain: 'HIVE',
  isKeychainActive: false,
  isHiveauthActive: false,
  // plugins/vue-custom.js: true for every std_login session (Keychain, HiveAuth, typed
  // key) - they all sign in the browser. Only HiveSigner (false) keeps the old route.
  $signsInBrowser: () => false,
  friendshipLoader: 'bob',
  addFriendError: '',
  $t: (k) => k,
  $notify: jest.fn(),
  populateFriends: jest.fn(),
  ...over
})

const txStub = { ref_block_num: 123, id: 'abc' }

describe('components/FriendshipModal propagateFriendReq', () => {
  beforeEach(() => {
    process.env.actiAppUrl = 'https://api.actifit.io/'
  })
  afterEach(() => {
    process.env.actiAppUrl = OLD_ENV
    jest.restoreAllMocks()
  })

  it('HiveSigner: fetches the standard addFriend endpoint and notifies on success', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ json: async () => ({ status: 'success' }) })
    global.fetch = fetchMock
    const c = ctx()

    await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', {}]])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0][0].toString()
    expect(calledUrl).toContain('addFriend/alice/bob/123/abc/HIVE')
    expect(calledUrl).not.toContain('addFriendHiveKeychain')
    expect(c.friendshipLoader).toBe(false)
    expect(c.$notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'success' }))
  })

  it('routes through the Keychain endpoint with the serialized operation', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ json: async () => ({ status: 'success' }) })
    global.fetch = fetchMock
    const c = ctx({ isKeychainActive: true, $signsInBrowser: () => true })

    await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', { id: 'actifit' }]])

    const calledUrl = fetchMock.mock.calls[0][0].toString()
    expect(calledUrl).toContain('addFriendHiveKeychain/alice/bob/123/abc/HIVE')
    expect(calledUrl).toContain('operation=')
  })

  it('routes through the Keychain endpoint when Hiveauth is active', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ json: async () => ({ status: 'success' }) })
    global.fetch = fetchMock
    const c = ctx({ isHiveauthActive: true, $signsInBrowser: () => true })

    await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', {}]])

    expect(fetchMock.mock.calls[0][0].toString()).toContain('addFriendHiveKeychain')
  })

  // The typed key now signs in the browser too, so the server never saw this
  // transaction: only the on-chain verified route can confirm it. The old addFriend
  // route reads verified_tx, which only server-side signing ever filled.
  it('routes a TYPED-KEY user through the on-chain verified endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ json: async () => ({ status: 'success' }) })
    global.fetch = fetchMock
    const c = ctx({ $signsInBrowser: () => true })

    await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', { id: 'actifit' }]])

    const calledUrl = fetchMock.mock.calls[0][0].toString()
    expect(calledUrl).toContain('addFriendHiveKeychain/alice/bob/123/abc/HIVE')
    expect(calledUrl).toContain('operation=')
  })

  it('clears the loader and surfaces an error when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'))
    const c = ctx()

    const result = await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', {}]])

    expect(result).toBe(false)
    expect(c.addFriendError).toBe('unknown_error')
    expect(c.friendshipLoader).toBe(false)
    expect(c.populateFriends).not.toHaveBeenCalled()
  })

  it('surfaces an error and clears the loader when the DB reports non-success', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ status: 'fail' }) })
    const c = ctx()

    const result = await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', {}]])

    expect(result).toBe(false)
    expect(c.addFriendError).toBe('unknown_error')
    expect(c.friendshipLoader).toBe(false)
    expect(c.$notify).not.toHaveBeenCalled()
  })
  it('shows the backend refusal message instead of the generic error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ status: 'error', message: 'Friend request already sent' }) })
    const c = ctx()

    const result = await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', {}]])

    expect(result).toBe(false)
    expect(c.addFriendError).toBe('Friend request already sent')
    expect(c.friendshipLoader).toBe(false)
  })

  it('escapes a backend message before it reaches the v-html error slot', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ status: 'error', message: '<b>x</b>' }) })
    const c = ctx()

    await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', {}]])

    expect(c.addFriendError).toBe('&lt;b&gt;x&lt;/b&gt;')
  })
})

describe('components/FriendshipModal addFriend pre-checks', () => {
  beforeEach(() => {
    process.env.actiAppUrl = 'https://api.actifit.io/'
    global.confirm = jest.fn(() => true)
  })
  afterEach(() => {
    process.env.actiAppUrl = OLD_ENV
    delete global.confirm
    delete global.fetch
    jest.restoreAllMocks()
  })

  const addCtx = (over = {}) => ctx({
    friendshipLoader: false,
    userFriends: [],
    friendRequests: { sent_pending: [], received_pending: [] },
    isFriend: () => false,
    $processTrxFunc: jest.fn().mockResolvedValue({ success: true, trx: { tx: txStub } }),
    propagateFriendReq: jest.fn(),
    ...over
  })

  it('refuses without signing when alice already sent bob a request', async () => {
    const c = addCtx({ friendRequests: { sent_pending: [{ target: 'bob' }], received_pending: [] } })

    const result = await Comp.methods.addFriend.call(c, 'bob')

    expect(result).toBe(false)
    expect(c.addFriendError).toBe('Friend_request_already_sent')
    expect(c.$processTrxFunc).not.toHaveBeenCalled()
    expect(global.confirm).not.toHaveBeenCalled()
  })

  it('refuses without signing when bob already sent alice a request', async () => {
    const c = addCtx({ friendRequests: { sent_pending: [], received_pending: [{ initiator: 'bob' }] } })

    const result = await Comp.methods.addFriend.call(c, 'bob')

    expect(result).toBe(false)
    expect(c.addFriendError).toBe('Friend_request_received_accept_instead')
    expect(c.$processTrxFunc).not.toHaveBeenCalled()
  })

  it('keeps the self and already-friends checks', async () => {
    const self = addCtx()
    expect(await Comp.methods.addFriend.call(self, 'alice')).toBe(false)
    expect(self.addFriendError).toBe('Cannot_friend_self')

    const friends = addCtx({ isFriend: () => true })
    expect(await Comp.methods.addFriend.call(friends, 'bob')).toBe(false)
    expect(friends.addFriendError).toBe('Already_friends')
    expect(friends.$processTrxFunc).not.toHaveBeenCalled()
  })

  it('fetches the pending requests when they are not loaded yet', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ sent_pending: [], received_pending: [{ initiator: 'bob' }] }) })
    const c = addCtx({ friendRequests: [] })

    const result = await Comp.methods.addFriend.call(c, 'bob')

    expect(global.fetch.mock.calls[0][0]).toBe('https://api.actifit.io/userFriendRequests/alice')
    expect(result).toBe(false)
    expect(c.addFriendError).toBe('Friend_request_received_accept_instead')
    expect(c.$processTrxFunc).not.toHaveBeenCalled()
  })

  it('still signs and propagates when nothing is pending', async () => {
    const c = addCtx({ friendRequests: { sent_pending: [{ target: 'carol' }], received_pending: [{ initiator: 'dave' }] } })

    await Comp.methods.addFriend.call(c, 'bob')

    expect(c.addFriendError).toBe('')
    expect(c.$processTrxFunc).toHaveBeenCalledTimes(1)
    expect(c.propagateFriendReq).toHaveBeenCalledWith(txStub, 'bob', expect.any(Array))
  })
})
