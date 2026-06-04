// Richer chain mocks for the pagination + comment-thread actions.
const mockHive = {
  getDiscussionsByCreated: jest.fn(),
  getDiscussionsByBlog: jest.fn(),
  call: jest.fn(),
  getContentRepliesAsync: jest.fn()
}
const mockSteem = { getDiscussionsByCreated: jest.fn() }

jest.mock('@hiveio/hive-js', () => ({
  config: { set: jest.fn() },
  api: {
    setOptions: jest.fn(),
    getDiscussionsByCreated: (...a) => mockHive.getDiscussionsByCreated(...a),
    getDiscussionsByBlog: (...a) => mockHive.getDiscussionsByBlog(...a),
    call: (...a) => mockHive.call(...a),
    getContentRepliesAsync: (...a) => mockHive.getContentRepliesAsync(...a)
  }
}))
jest.mock('steem', () => ({
  api: { setOptions: jest.fn(), getDiscussionsByCreated: (...a) => mockSteem.getDiscussionsByCreated(...a) }
}))
jest.mock('@blurtfoundation/blurtjs', () => ({ api: { setOptions: jest.fn() } }))

import actions from '@/store/actions'

const API = 'https://api.actifit.test/'
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
const jsonResponse = (data) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) })

const activityPost = (author, permlink, extra = {}) => ({
  author,
  permlink,
  json_metadata: JSON.stringify({ step_count: 100, activity_type: ['walking'], tags: ['actifit'], ...extra })
})

function makeState (overrides = {}) {
  return {
    steemconnect: { user: { account: { name: 'alice' } } },
    reports: [], posts: [], userReports: [], userPosts: [], userComments: [],
    bchain: '',
    ...overrides
  }
}

describe('store/actions — pagination & comment threads', () => {
  let commit, dispatch

  beforeAll(() => {
    process.env.actiAppUrl = API
    process.env.maxPostCount = 20
    process.env.hiveApiNode = 'https://hive.test'
  })

  beforeEach(() => {
    commit = jest.fn()
    dispatch = jest.fn()
    global.fetch = jest.fn()
    Object.values(mockHive).forEach(fn => fn.mockReset())
    mockSteem.getDiscussionsByCreated.mockReset()
  })

  afterEach(() => { delete global.fetch })

  describe('fetchReports', () => {
    it('drops the seed post, filters banned authors, appends the rest, and checks for more', async () => {
      global.fetch.mockReturnValue(jsonResponse([{ user: 'spammer' }]))
      mockHive.getDiscussionsByCreated.mockImplementation((opts, cb) => {
        cb(null, [
          activityPost('seed', 'p0'),       // seed (shifted off)
          activityPost('alice', 'p1'),      // kept
          activityPost('spammer', 'p2')     // banned -> removed
        ])
      })

      actions.fetchReports({ state: makeState(), commit, dispatch })
      await flush()

      const [mutation, payload] = commit.mock.calls.find(c => c[0] === 'setReports')
      expect(mutation).toBe('setReports')
      expect(payload.map(p => p.author)).toEqual(['alice'])
      expect(dispatch).toHaveBeenCalledWith('checkIfMoreReportsAvailable')
    })

    it('appends to existing reports rather than replacing them', async () => {
      global.fetch.mockReturnValue(jsonResponse([]))
      mockHive.getDiscussionsByCreated.mockImplementation((opts, cb) => {
        cb(null, [activityPost('seed', 'p0'), activityPost('bob', 'p9')])
      })
      const existing = [activityPost('carol', 'p5')]

      actions.fetchReports({ state: makeState({ reports: existing }), commit, dispatch })
      await flush()

      const payload = commit.mock.calls.find(c => c[0] === 'setReports')[1]
      expect(payload.map(p => p.author)).toEqual(['carol', 'bob'])
    })
  })

  describe('checkIfMorePostsAvailable', () => {
    it('flags more posts available when extra posts come back', async () => {
      mockHive.getDiscussionsByCreated.mockImplementation((opts, cb) => {
        cb(null, [{ author: 'seed', permlink: 'p0' }, { author: 'x', permlink: 'p1' }])
      })
      await actions.checkIfMorePostsAvailable({ state: makeState(), commit })
      expect(commit).toHaveBeenCalledWith('setMorePostsAvailable', true)
    })

    it('flags none available when only the seed post returns', async () => {
      mockHive.getDiscussionsByCreated.mockImplementation((opts, cb) => cb(null, [{ author: 'seed', permlink: 'p0' }]))
      await actions.checkIfMorePostsAvailable({ state: makeState(), commit })
      expect(commit).toHaveBeenCalledWith('setMorePostsAvailable', false)
    })
  })

  describe('fetchUserReports', () => {
    it('filters to the user\'s own activity reports and does not shift on first page', async () => {
      mockHive.getDiscussionsByBlog.mockImplementation((opts, cb) => {
        cb(null, [
          activityPost('alice', 'a1'),                 // valid, kept
          activityPost('bob', 'b1'),                   // resteem from another author -> filtered
          { author: 'alice', permlink: 'plain', json_metadata: JSON.stringify({ tags: ['actifit'] }) } // not an activity post
        ])
      })
      actions.fetchUserReports({ state: makeState(), commit, dispatch }, 'alice')
      await flush()

      const payload = commit.mock.calls.find(c => c[0] === 'setUserReports')[1]
      expect(payload.map(p => p.permlink)).toEqual(['a1'])
      expect(dispatch).toHaveBeenCalledWith('checkIfMoreUserReportsAvailable', 'alice')
    })

    it('queries the blog endpoint with the username as the tag', async () => {
      mockHive.getDiscussionsByBlog.mockImplementation((opts, cb) => cb(null, []))
      actions.fetchUserReports({ state: makeState(), commit, dispatch }, 'alice')
      await flush()
      expect(mockHive.getDiscussionsByBlog).toHaveBeenCalledWith(
        expect.objectContaining({ tag: 'alice' }),
        expect.any(Function)
      )
    })
  })

  describe('fetchUserComments', () => {
    it('calls the bridge account-posts API and appends comments', async () => {
      mockHive.call.mockImplementation((method, params, cb) => cb(null, [{ author: 'alice', permlink: 'c1' }]))
      actions.fetchUserComments({ state: makeState(), commit, dispatch }, 'alice')
      await flush()

      expect(mockHive.call).toHaveBeenCalledWith(
        'bridge.get_account_posts',
        expect.objectContaining({ sort: 'comments', account: 'alice' }),
        expect.any(Function)
      )
      expect(commit).toHaveBeenCalledWith('setUserComments', [{ author: 'alice', permlink: 'c1' }])
      expect(dispatch).toHaveBeenCalledWith('checkIfMoreUserCommentsAvailable', 'alice')
    })
  })

  describe('fetchPopCommunities', () => {
    it('resolves with the communities returned by the bridge API', async () => {
      const comms = [{ name: 'hive-193552' }]
      mockHive.call.mockImplementation((method, params, cb) => cb(null, comms))
      const result = await actions.fetchPopCommunities({ state: makeState(), commit })
      expect(result).toBe(comms)
    })
  })

  describe('fetchReportComments (recursive comment tree)', () => {
    const report = { author: 'alice', permlink: 'root', title: 'My report' }

    it('builds a nested reply_entries tree and commits it', async () => {
      // root has one reply (c1) which itself has one nested reply (c2)
      mockHive.getContentRepliesAsync.mockImplementation(async (author, permlink) => {
        if (permlink === 'root') return [{ author: 'bob', permlink: 'c1', children: 1 }]
        if (permlink === 'c1') return [{ author: 'carol', permlink: 'c2', children: 0 }]
        return []
      })

      const result = await actions.fetchReportComments({ state: makeState(), commit, dispatch }, report)

      // top-level structure
      expect(result.author).toBe('alice')
      expect(result.reply_entries).toHaveLength(1)
      // nested replies populated recursively
      expect(result.reply_entries[0].permlink).toBe('c1')
      expect(result.reply_entries[0].reply_entries[0].permlink).toBe('c2')
      // leaf nodes always get an empty array (never undefined)
      expect(result.reply_entries[0].reply_entries[0].reply_entries).toEqual([])
      expect(commit).toHaveBeenCalledWith('setCommentEntries', result)
    })

    it('on API failure, commits the report with empty replies and rejects', async () => {
      mockHive.getContentRepliesAsync.mockRejectedValue(new Error('node down'))

      await expect(
        actions.fetchReportComments({ state: makeState(), commit, dispatch }, report)
      ).rejects.toThrow('node down')

      expect(commit).toHaveBeenCalledWith('setCommentEntries', { ...report, reply_entries: [] })
    })
  })
})
