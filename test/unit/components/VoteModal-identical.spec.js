// Re-voting a post at the weight already cast is rejected by the chain ("Your current vote
// on this comment is identical to this vote"); the modal showed only "error voting". It now
// reads the post's current votes and says so before broadcasting. Also: several fetches
// called an undefined `reject` when they failed ("ReferenceError: reject is not defined").
import fs from 'fs'
import path from 'path'

const read = (file) => fs.readFileSync(path.resolve(__dirname, '../../..', file), 'utf8')
const src = read('components/VoteModal.vue')

// methods are cut from the source and run with a stubbed `this` (the modal is too heavy to mount)
const method = (signature, params = []) => {
  const start = src.indexOf(`\t\t${signature} {`)
  expect(start).toBeGreaterThan(-1)
  const end = src.slice(start).search(/\n\t\t\},?\n/)
  const body = src.slice(src.indexOf('{', start) + 1, start + end)
  // eslint-disable-next-line no-new-func
  return new Function('hive', 'steem', 'blurt', ...params, `return (async () => {${body}})()`)
}
const fns = {
  vote: method('async vote(e)', ['e']),
  currentVotes: method('async currentVotes()'),
}
const libs = (votes) => {
  const lib = () => ({ api: { getActiveVotesAsync: jest.fn(async () => (votes instanceof Error ? Promise.reject(votes) : votes)) } })
  return { hive: lib(), steem: lib(), blurt: lib() }
}
const call = (name, v, l, ...args) => fns[name].call(v, l.hive, l.steem, l.blurt, ...args)

// the modal, with every broadcast path stubbed
const modal = ({ listing = [], chainVotes = null, voteWeight = 100, paid = false, chain = 'HIVE' } = {}) => {
  const l = libs(chainVotes)
  const v = {
    user: { account: { name: 'alice' } }, voteWeight, cur_bchain: chain, loading: false, target_bchain: chain,
    postToVote: { author: 'bob', permlink: 'post', active_votes: listing },
    $t: (k) => (k === 'vote_identical' ? 'You already voted _WEIGHT_% on this post.' : k),
    $notify: jest.fn(),
    $steemconnect: { broadcast: jest.fn(async () => ({ result: { ref_block_num: 1 } })) },
    processTrxFunc: jest.fn(async () => ({ success: true })),
    voteSuccess: jest.fn(),
    postPaid: () => paid,
  }
  v.currentVotes = jest.fn(() => call('currentVotes', v, l))
  v.sameWeightVote = (votes) => sync.sameWeightVote.call(v, votes)
  v.userVotedThisPost = (votes) => sync.userVotedThisPost.call(v, votes)
  return { v, l }
}
// sameWeightVote / userVotedThisPost have no await: run them synchronously
const syncFn = (sig, params) => {
  const start = src.indexOf(`\t\t${sig} {`)
  const end = src.slice(start).search(/\n\t\t\},?\n/)
  // eslint-disable-next-line no-new-func
  return new Function(...params, src.slice(src.indexOf('{', start) + 1, start + end))
}
const sync = {
  sameWeightVote: syncFn('sameWeightVote(votes)', ['votes']),
  userVotedThisPost: syncFn('userVotedThisPost(votes)', ['votes']),
}

const broadcasts = (v) => v.$steemconnect.broadcast.mock.calls.length + v.processTrxFunc.mock.calls.length +
  (window.hive_keychain ? window.hive_keychain.requestBroadcast.mock.calls.length : 0)

beforeEach(() => {
  localStorage.setItem('std_login', 'true')
  localStorage.removeItem('acti_login_method')
  window.confirm = jest.fn(() => true)
  delete window.hive_keychain
})
afterEach(() => { localStorage.clear(); jest.restoreAllMocks() })

describe('voting again at the same weight', () => {
  it('is refused before anything is broadcast, with the weight in the message', async () => {
    const { v } = modal({ chainVotes: [{ voter: 'alice', percent: 10000 }] })
    await call('vote', v, libs(), {})
    expect(broadcasts(v)).toBe(0)
    expect(v.$notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'error', text: 'You already voted 100% on this post.' }))
    expect(v.loading).toBe(false)
    // no "change your vote?" prompt for a vote that cannot go through
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('for every login method', async () => {
    for (const method of ['keychain', 'hiveauth', null]) {
      if (method) localStorage.setItem('acti_login_method', method)
      window.hive_keychain = { requestBroadcast: jest.fn() }
      const { v } = modal({ chainVotes: [{ voter: 'alice', percent: 10000 }] })
      await call('vote', v, libs(), {})
      expect(broadcasts(v)).toBe(0)
    }
    localStorage.removeItem('std_login')
    const { v } = modal({ chainVotes: [{ voter: 'alice', percent: 10000 }] })
    await call('vote', v, libs(), {})
    expect(broadcasts(v)).toBe(0)
  })

  it('a paid-out post: told it is identical, not first asked to confirm a paid-out vote', async () => {
    const { v } = modal({ chainVotes: [{ voter: 'alice', percent: 10000 }], paid: true })
    await call('vote', v, libs(), {})
    expect(window.confirm).not.toHaveBeenCalled()
    expect(v.$notify).toHaveBeenCalled()
  })

  it('a downvote reads "100%", not "-100%"', async () => {
    const { v } = modal({ chainVotes: [{ voter: 'alice', percent: -10000 }], voteWeight: -100 })
    await call('vote', v, libs(), {})
    expect(v.$notify).toHaveBeenCalledWith(expect.objectContaining({ text: 'You already voted 100% on this post.' }))
  })

  it('hivemind listings (no percent) are covered: the chain\'s current votes are read', async () => {
    const { v } = modal({ listing: [{ voter: 'alice', rshares: 123 }], chainVotes: [{ voter: 'alice', percent: 10000 }] })
    await call('vote', v, libs(), {})
    expect(broadcasts(v)).toBe(0)
  })

  it('a stale listing does not block a real change (the vote was changed in another app)', async () => {
    const { v } = modal({ listing: [{ voter: 'alice', percent: 10000 }], chainVotes: [{ voter: 'alice', percent: 5000 }] })
    await call('vote', v, libs(), {})
    // a change: confirmed, then broadcast
    expect(window.confirm).toHaveBeenCalledWith('confirm_vote_change')
    expect(broadcasts(v)).toBe(1)
  })

  it('"change your vote?" also follows the chain: a vote cast elsewhere since the page loaded', async () => {
    const { v } = modal({ listing: [], chainVotes: [{ voter: 'alice', percent: 5000 }] })
    await call('vote', v, libs(), {})
    expect(window.confirm).toHaveBeenCalledWith('confirm_vote_change')
  })

  it('when the chain cannot be read, the listing decides', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const blocked = modal({ listing: [{ voter: 'alice', percent: '10000' }], chainVotes: new Error('down') })
    await call('vote', blocked.v, libs(), {})
    expect(broadcasts(blocked.v)).toBe(0)
    const goes = modal({ listing: [{ voter: 'alice', percent: '5000' }], chainVotes: new Error('down') })
    await call('vote', goes.v, libs(), {})
    expect(broadcasts(goes.v)).toBe(1)
  })

  it('a new vote, or a different weight, goes through as before', async () => {
    const fresh = modal({ chainVotes: [{ voter: 'bob', percent: 10000 }] })
    await call('vote', fresh.v, libs(), {})
    expect(window.confirm).not.toHaveBeenCalled()
    expect(broadcasts(fresh.v)).toBe(1)
  })

  it('sameWeightVote: string or number percent; unknown percent is not 0', () => {
    const v = { user: { account: { name: 'alice' } }, voteWeight: 25, postToVote: { active_votes: [] } }
    expect(sync.sameWeightVote.call(v, [{ voter: 'alice', percent: '2500' }])).toBeTruthy()
    expect(sync.sameWeightVote.call(v, [{ voter: 'alice', percent: 2500 }])).toBeTruthy()
    expect(sync.sameWeightVote.call(v, [{ voter: 'alice', percent: 5000 }])).toBe(null)
    expect(sync.sameWeightVote.call(v, [{ voter: 'bob', percent: 2500 }])).toBe(null)
    v.voteWeight = 0
    expect(sync.sameWeightVote.call(v, [{ voter: 'alice', percent: null }])).toBe(null)
  })

  it('the vote the modal records after voting keeps the chain\'s units (so a repeat is caught)', () => {
    expect(src).toContain('percent: this.voteWeight * 100')
  })
})

// Keychain crashed or disabled: the vote fell through to the typed-key path, which refuses
// Keychain sessions, and the user saw only "error voting" with no popup.
describe('logged in with Keychain, but Keychain is not on the page', () => {
  it('says Keychain was not detected, reads nothing and broadcasts nothing', async () => {
    localStorage.setItem('acti_login_method', 'keychain')
    const { v } = modal({ chainVotes: [] })
    await call('vote', v, libs(), {})
    expect(v.$notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'error', text: 'keychain_not_detected' }))
    expect(v.$notify).toHaveBeenCalledTimes(1)
    expect(v.currentVotes).not.toHaveBeenCalled()
    expect(broadcasts(v)).toBe(0)
    expect(v.loading).toBe(false)
  })

  it('with Keychain present, the vote goes to Keychain as before', async () => {
    localStorage.setItem('acti_login_method', 'keychain')
    window.hive_keychain = { requestBroadcast: jest.fn() }
    const { v } = modal({ chainVotes: [] })
    await call('vote', v, libs(), {})
    expect(window.hive_keychain.requestBroadcast).toHaveBeenCalledTimes(1)
    expect(v.$notify).not.toHaveBeenCalled()
  })
})

describe('reading the current votes', () => {
  it('from the selected chain', async () => {
    for (const chain of ['HIVE', 'BLURT', 'STEEM']) {
      const l = libs([{ voter: 'x', percent: 1 }])
      const v = { cur_bchain: chain, postToVote: { author: 'bob', permlink: 'p' } }
      expect(await call('currentVotes', v, l)).toEqual([{ voter: 'x', percent: 1 }])
      expect(l[chain.toLowerCase()].api.getActiveVotesAsync).toHaveBeenCalledWith('bob', 'p')
    }
  })

  it('null when unreadable: a node error, a non-list answer (hive-js turns some errors into a string), or no post', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const v = { cur_bchain: 'HIVE', postToVote: { author: 'bob', permlink: 'p' } }
    expect(await call('currentVotes', v, libs(new Error('down')))).toBe(null)
    expect(await call('currentVotes', v, libs('{"id":0, "result":[]}'))).toBe(null)
    expect(await call('currentVotes', { cur_bchain: 'HIVE', postToVote: null }, libs([]))).toBe(null)
  })

  it('gives up after 5 seconds rather than hold the vote', async () => {
    jest.useFakeTimers()
    const l = { hive: { api: { getActiveVotesAsync: () => new Promise(() => {}) } } }
    const pending = call('currentVotes', { cur_bchain: 'HIVE', postToVote: { author: 'b', permlink: 'p' } }, l)
    jest.advanceTimersByTime(5000)
    await expect(pending).resolves.toBe(null)
    jest.useRealTimers()
  })
})

describe('locales', () => {
  it('every locale has the message, with the weight placeholder', () => {
    const locales = fs.readdirSync(path.resolve(__dirname, '../../../lang')).filter((f) => f.endsWith('.js'))
    expect(locales).toHaveLength(14)
    for (const file of locales) {
      expect(read('lang/' + file)).toMatch(/\n {2}vote_identical: '[^'\n]*_WEIGHT_[^'\n]*',\n/)
    }
  })
})

describe('fetches that called an undefined reject()', () => {
  it.each(['components/PostModal.vue', 'components/VotingStatus.vue', 'pages/_username/index.vue', 'pages/yieldfarming.vue'])('%s logs a failed fetch instead', (file) => {
    expect(read(file)).not.toMatch(/\.catch\(e => reject\(e\)\)/)
  })
})
