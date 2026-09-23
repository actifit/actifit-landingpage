// store/actions.js calls hive.config.set / *.api.setOptions at import time and
// uses the chain libs inside some actions. Mock all three so importing the
// module has no network side effects and we can drive chain calls.
const mockHiveGetDiscussions = jest.fn()
const mockSteemGetDiscussions = jest.fn()

jest.mock('@hiveio/hive-js', () => ({
  config: { set: jest.fn() },
  api: { setOptions: jest.fn(), getDiscussionsByCreated: (...a) => mockHiveGetDiscussions(...a) }
}))
jest.mock('steem', () => ({
  api: { setOptions: jest.fn(), getDiscussionsByCreated: (...a) => mockSteemGetDiscussions(...a) }
}))
jest.mock('@blurtfoundation/blurtjs', () => ({
  api: { setOptions: jest.fn() }
}))

import actions from '@/store/actions'

const API = 'https://api.actifit.test/'

// Many of these actions return a Promise that never resolves but commit
// asynchronously inside nested .then() callbacks. So we DON'T await the action;
// we flush the microtask/macrotask queue and then assert on commit/fetch.
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

// Build a fake fetch Response with a json() resolving to `data`.
function jsonResponse (data, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data)
  })
}

function makeState (overrides = {}) {
  return {
    steemconnect: { user: { account: { name: 'Alice' } } },
    reports: [],
    bchain: '',
    ...overrides
  }
}

describe('store/actions', () => {
  let commit

  beforeAll(() => {
    process.env.actiAppUrl = API
    process.env.maxPostCount = 20
  })

  beforeEach(() => {
    commit = jest.fn()
    global.fetch = jest.fn()
    mockHiveGetDiscussions.mockReset()
    mockSteemGetDiscussions.mockReset()
  })

  afterEach(() => {
    delete global.fetch
  })

  describe('fetch + commit actions', () => {
    it('fetchUserTokens hits the user endpoint (lowercased) and commits setUserTokens', async () => {
      global.fetch.mockReturnValue(jsonResponse({ tokens: 150 }))
      actions.fetchUserTokens({ state: makeState(), commit })
      await flush()

      expect(global.fetch).toHaveBeenCalledWith(API + 'user/alice')
      expect(commit).toHaveBeenCalledWith('setUserTokens', 150)
    })

    it('fetchUserTokens prefers an explicit target user over the logged-in user', async () => {
      global.fetch.mockReturnValue(jsonResponse({ tokens: 5 }))
      actions.fetchUserTokens({ state: makeState(), commit }, 'bob')
      await flush()

      expect(global.fetch).toHaveBeenCalledWith(API + 'user/bob')
    })

    it('fetchTransactions commits an empty array when the API returns null', async () => {
      global.fetch.mockReturnValue(jsonResponse(null))
      actions.fetchTransactions({ state: makeState(), commit })
      await flush()

      expect(commit).toHaveBeenCalledWith('setTransactions', [])
    })

    it('fetchUserRank commits the full rank object via setUserRank', async () => {
      const rank = { user_rank: 9 }
      global.fetch.mockReturnValue(jsonResponse(rank))
      actions.fetchUserRank({ state: makeState(), commit })
      await flush()

      expect(global.fetch).toHaveBeenCalledWith(API + 'getRank/alice')
      expect(commit).toHaveBeenCalledWith('setUserRank', rank)
    })

    it('fetchModerators commits the list with no user dependency', async () => {
      global.fetch.mockReturnValue(jsonResponse([{ name: 'mod1' }]))
      actions.fetchModerators({ commit })
      await flush()

      expect(global.fetch).toHaveBeenCalledWith(API + 'moderators')
      expect(commit).toHaveBeenCalledWith('setModerators', [{ name: 'mod1' }])
    })

    it('fetchFeaturedActifitter hits /featuredActifitter and commits the doc', async () => {
      const doc = { username: 'jane', display_name: 'Jane Doe' }
      global.fetch.mockReturnValue(jsonResponse(doc))
      const result = await actions.fetchFeaturedActifitter({ commit })
      expect(global.fetch).toHaveBeenCalledWith(API + 'featuredActifitter')
      expect(commit).toHaveBeenCalledWith('setFeaturedActifitter', doc)
      expect(result).toEqual(doc)
    })

    it('fetchFeaturedActifitter commits null and resolves (never rejects) when the fetch fails', async () => {
      global.fetch.mockReturnValue(Promise.reject(new Error('api down')))
      const result = await actions.fetchFeaturedActifitter({ commit })
      expect(commit).toHaveBeenCalledWith('setFeaturedActifitter', null)
      expect(result).toBeNull()
    })

    it('fetchArenaChallenges hits the arena endpoint with filters and commits setArenaChallenges', async () => {
      global.fetch.mockReturnValue(jsonResponse([{ id: 'ch1' }]))
      actions.fetchArenaChallenges({ commit }, { state: 'open' })
      await flush()

      expect(global.fetch).toHaveBeenCalledWith(API + 'arena/challenges?state=open')
      expect(commit).toHaveBeenCalledWith('setArenaChallenges', [{ id: 'ch1' }])
    })

    it('fetchArenaChallenges omits empty/undefined filter params', async () => {
      global.fetch.mockReturnValue(jsonResponse([]))
      actions.fetchArenaChallenges({ commit }, { state: '', type: undefined })
      await flush()

      expect(global.fetch).toHaveBeenCalledWith(API + 'arena/challenges')
    })

    it('fetchArenaChallenges rejects (no commit) when fetch fails — page falls through to empty state', async () => {
      global.fetch.mockReturnValue(Promise.reject(new Error('network down')))
      await expect(actions.fetchArenaChallenges({ commit })).rejects.toThrow('network down')
      expect(commit).not.toHaveBeenCalled()
    })

    it('fetchArenaChallenge hits the by-id endpoint and commits setArenaChallenge', async () => {
      const payload = { challenge: { id: 'ch1' }, participants: [] }
      global.fetch.mockReturnValue(jsonResponse(payload))
      const result = await actions.fetchArenaChallenge({ commit }, 'ch1')
      expect(global.fetch).toHaveBeenCalledWith(API + 'arena/challenges/ch1')
      expect(commit).toHaveBeenCalledWith('setArenaChallenge', payload)
      expect(result).toEqual(payload)
    })

    it('fetchArenaChallenge rejects (no commit) on a 404 so the page shows not-found', async () => {
      global.fetch.mockReturnValue(jsonResponse({ error: 'not found' }, false, 404))
      await expect(actions.fetchArenaChallenge({ commit }, 'nope')).rejects.toThrow(/HTTP Error: 404/)
      expect(commit).not.toHaveBeenCalled()
    })

    it('fetchArenaStandings hits the standings endpoint with the id and commits setArenaStandings', async () => {
      const standings = { id: 'ch1', rows: [{ entity: 'alice', rank: 1, score: 9 }] }
      global.fetch.mockReturnValue(jsonResponse(standings))
      await actions.fetchArenaStandings({ commit }, 'ch1')
      await flush()
      expect(global.fetch).toHaveBeenCalledWith(API + 'arena/standings?id=ch1')
      expect(commit).toHaveBeenCalledWith('setArenaStandings', standings)
    })

    it('fetchArenaStandings commits null (empty board) on an empty/invalid body, without rejecting', async () => {
      global.fetch.mockReturnValue(Promise.resolve({ ok: true, status: 200, json: () => Promise.reject(new Error('Unexpected end of JSON input')) }))
      await expect(actions.fetchArenaStandings({ commit }, 'ch1')).resolves.toBeNull()
      expect(commit).toHaveBeenCalledWith('setArenaStandings', null)
    })

    it('fetchArenaMerits hits the merits endpoint and commits setArenaMerits', async () => {
      const merits = { user: 'alice', balance: 240, ledger: [] }
      global.fetch.mockReturnValue(jsonResponse(merits))
      await actions.fetchArenaMerits({ commit }, 'alice')
      await flush()
      expect(global.fetch).toHaveBeenCalledWith(API + 'arena/merits/alice')
      expect(commit).toHaveBeenCalledWith('setArenaMerits', merits)
    })

    it('fetchArenaMerits commits null and resolves when no user is given', async () => {
      await expect(actions.fetchArenaMerits({ commit }, null)).resolves.toBeNull()
      expect(commit).toHaveBeenCalledWith('setArenaMerits', null)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('fetchTopDelegators query handling', () => {
    it('appends ?count= when given an integer', async () => {
      global.fetch.mockReturnValue(jsonResponse([]))
      actions.fetchTopDelegators({ state: makeState(), commit }, 10)
      await flush()
      expect(global.fetch).toHaveBeenCalledWith(API + 'topDelegators?count=10')
    })

    it('omits the query string for non-integer input', async () => {
      global.fetch.mockReturnValue(jsonResponse([]))
      actions.fetchTopDelegators({ state: makeState(), commit }, undefined)
      await flush()
      expect(global.fetch).toHaveBeenCalledWith(API + 'topDelegators')
    })
  })

  describe('async actions with error handling', () => {
    it('fetchClaimableSignupLinks returns parsed json on success', async () => {
      global.fetch.mockReturnValue(jsonResponse({ links: 3 }))
      const result = await actions.fetchClaimableSignupLinks({ state: makeState(), commit })
      expect(result).toEqual({ links: 3 })
    })

    it('fetchClaimableSignupLinks throws on a non-ok response', async () => {
      global.fetch.mockReturnValue(jsonResponse({ message: 'nope' }, false, 500))
      await expect(
        actions.fetchClaimableSignupLinks({ state: makeState(), commit })
      ).rejects.toThrow(/HTTP Error: 500/)
    })
  })

  describe('checkIfMoreReportsAvailable (chain-backed pagination)', () => {
    const activityPost = (author, permlink) => ({
      author,
      permlink,
      json_metadata: JSON.stringify({ step_count: 100, activity_type: ['walking'] })
    })

    it('drops the seed post, keeps activity reports, and flags more available', async () => {
      // returns the seed (last known) post + one genuine activity report
      mockHiveGetDiscussions.mockImplementation((opts, cb) => {
        cb(null, [activityPost('seed', 'p0'), activityPost('alice', 'p1')])
      })
      await actions.checkIfMoreReportsAvailable({ state: makeState({ reports: [activityPost('x', 'p0')] }), commit })

      expect(commit).toHaveBeenCalledWith('setMoreReportsAvailable', true)
    })

    it('flags none available when only the seed post comes back', async () => {
      mockHiveGetDiscussions.mockImplementation((opts, cb) => {
        cb(null, [activityPost('seed', 'p0')])
      })
      await actions.checkIfMoreReportsAvailable({ state: makeState(), commit })

      expect(commit).toHaveBeenCalledWith('setMoreReportsAvailable', false)
    })

    it('filters out non-activity posts (missing step_count/activity_type)', async () => {
      mockHiveGetDiscussions.mockImplementation((opts, cb) => {
        cb(null, [
          activityPost('seed', 'p0'),
          { author: 'bob', permlink: 'p2', json_metadata: JSON.stringify({ tags: ['actifit'] }) }
        ])
      })
      await actions.checkIfMoreReportsAvailable({ state: makeState(), commit })

      expect(commit).toHaveBeenCalledWith('setMoreReportsAvailable', false)
    })

    it('uses the steem chain link when state.bchain is STEEM', async () => {
      mockSteemGetDiscussions.mockImplementation((opts, cb) => cb(null, []))
      await actions.checkIfMoreReportsAvailable({ state: makeState({ bchain: 'STEEM' }), commit })

      expect(mockSteemGetDiscussions).toHaveBeenCalled()
      expect(mockHiveGetDiscussions).not.toHaveBeenCalled()
    })
  })
})
