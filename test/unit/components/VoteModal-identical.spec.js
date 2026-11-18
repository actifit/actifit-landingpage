// Re-voting a post at the weight already cast is rejected by the chain ("Your current vote
// on this comment is identical to this vote"); the modal showed only "error voting". It now
// says so before broadcasting. Also: the post popup's token-rewards fetch called an
// undefined `reject` when the Scot API failed ("ReferenceError: reject is not defined").
import fs from 'fs'
import path from 'path'

const read = (file) => fs.readFileSync(path.resolve(__dirname, '../../..', file), 'utf8')
const src = read('components/VoteModal.vue')

const method = (signature) => {
  const start = src.indexOf(`\t\t${signature} {`)
  expect(start).toBeGreaterThan(-1)
  const body = src.slice(src.indexOf('{', start) + 1, src.indexOf('\n\t\t},', start))
  // eslint-disable-next-line no-new-func
  return new Function(body)
}
const sameWeightVote = method('sameWeightVote()')

const modal = (votes, voteWeight) => ({
  user: { account: { name: 'alice' } }, voteWeight, postToVote: { active_votes: votes },
})

describe('voting again at the same weight', () => {
  it('is recognised, whether the listing gives percent as a number or a string', () => {
    expect(sameWeightVote.call(modal([{ voter: 'alice', percent: 10000 }], 100))).toEqual({ voter: 'alice', percent: 10000 })
    expect(sameWeightVote.call(modal([{ voter: 'bob', percent: '600' }, { voter: 'alice', percent: '2500' }], 25))).toBeTruthy()
    // a downvote at the same weight too
    expect(sameWeightVote.call(modal([{ voter: 'alice', percent: -10000 }], -100))).toBeTruthy()
  })

  it('a different weight, someone else\'s vote, no vote, or no percent in the listing: not the same', () => {
    expect(sameWeightVote.call(modal([{ voter: 'alice', percent: 10000 }], 50))).toBe(null)
    expect(sameWeightVote.call(modal([{ voter: 'bob', percent: 10000 }], 100))).toBe(null)
    expect(sameWeightVote.call(modal([], 100))).toBe(null)
    // hivemind listings carry only voter and rshares: the chain decides
    expect(sameWeightVote.call(modal([{ voter: 'alice', rshares: 123 }], 100))).toBe(null)
    // an unknown percent is not 0: removing that vote is left to the chain
    expect(sameWeightVote.call(modal([{ voter: 'alice', percent: null }], 0))).toBe(null)
    // removing a vote (0%) when there is one is a change
    expect(sameWeightVote.call(modal([{ voter: 'alice', percent: 10000 }], 0))).toBe(null)
  })

  it('is checked before the vote-change prompt and before anything is broadcast, for every login method', () => {
    const vote = src.slice(src.indexOf('\t\tasync vote(e) {'))
    const check = vote.indexOf('const sameVote = this.sameWeightVote();')
    expect(check).toBeGreaterThan(-1)
    expect(vote.slice(check, check + 400)).toMatch(/if \(sameVote\) \{[\s\S]*?vote_identical[\s\S]*?return;\s*\}/)
    expect(check).toBeLessThan(vote.indexOf('if (this.userVotedThisPost())'))
    expect(check).toBeLessThan(vote.indexOf('$steemconnect.broadcast'))
    expect(check).toBeLessThan(vote.indexOf('hive_keychain.requestBroadcast'))
    expect(check).toBeLessThan(vote.indexOf('this.processTrxFunc('))
  })

  it('every locale has the message, with the weight placeholder', () => {
    const locales = fs.readdirSync(path.resolve(__dirname, '../../../lang')).filter((f) => f.endsWith('.js'))
    expect(locales).toHaveLength(14)
    for (const file of locales) {
      expect(read('lang/' + file)).toMatch(/\n {2}vote_identical: '[^'\n]*_WEIGHT_[^'\n]*',\n/)
    }
  })
})

describe('post popup token rewards', () => {
  it('a failed Scot API call is logged, not a ReferenceError', () => {
    const popup = read('components/PostModal.vue')
    expect(popup).not.toMatch(/\breject\(e\)/)
    expect(popup).toMatch(/this\.setPostTokenRewards\(json\)\)\.catch\(e => console\.error\(e\)\)/)
  })
})
