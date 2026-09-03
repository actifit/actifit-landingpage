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

  it('fetches the standard addFriend endpoint and notifies on success', async () => {
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
    const c = ctx({ isKeychainActive: true })

    await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', { id: 'actifit' }]])

    const calledUrl = fetchMock.mock.calls[0][0].toString()
    expect(calledUrl).toContain('addFriendHiveKeychain/alice/bob/123/abc/HIVE')
    expect(calledUrl).toContain('operation=')
  })

  it('routes through the Keychain endpoint when Hiveauth is active', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ json: async () => ({ status: 'success' }) })
    global.fetch = fetchMock
    const c = ctx({ isHiveauthActive: true })

    await Comp.methods.propagateFriendReq.call(c, txStub, 'bob', [['custom_json', {}]])

    expect(fetchMock.mock.calls[0][0].toString()).toContain('addFriendHiveKeychain')
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
})
