// The proposal vote popup: shown only to logged-in users who have not voted for the
// configured proposal, and votes through the shared signer (active key) or HiveSigner.
const mockCallAsync = jest.fn()
jest.mock('@hiveio/hive-js', () => ({
  config: { set: jest.fn() },
  api: { setOptions: jest.fn(), callAsync: (...a) => mockCallAsync(...a) }
}))
jest.mock('steem', () => ({ api: { setOptions: jest.fn() } }))
jest.mock('@blurtfoundation/blurtjs', () => ({ api: { setOptions: jest.fn() } }))

import Comp from '~/components/VoteProposalModal.vue'
import actions from '@/store/actions'

const vote = (voter, id) => ({ voter, proposal: { id } })

describe('store hasVotedProposal', () => {
  beforeEach(() => mockCallAsync.mockReset())

  it('reads only this user\'s vote from the (proposal, voter) index', async () => {
    mockCallAsync.mockResolvedValue([vote('alice', 391)])
    await expect(actions.hasVotedProposal({}, { proposalId: '391', username: 'alice' })).resolves.toBe(true)
    expect(mockCallAsync).toHaveBeenCalledWith('condenser_api.list_proposal_votes',
      [[391, 'alice'], 1, 'by_proposal_voter', 'ascending', 'all'])
  })

  it('is false when the next entry is another voter or another proposal', async () => {
    mockCallAsync.mockResolvedValue([vote('alicia', 391)])
    await expect(actions.hasVotedProposal({}, { proposalId: 391, username: 'alice' })).resolves.toBe(false)
    mockCallAsync.mockResolvedValue([vote('aaron', 392)])
    await expect(actions.hasVotedProposal({}, { proposalId: 391, username: 'alice' })).resolves.toBe(false)
    mockCallAsync.mockResolvedValue([])
    await expect(actions.hasVotedProposal({}, { proposalId: 391, username: 'alice' })).resolves.toBe(false)
  })
})

// a mocked `this`, per repo convention
function ctx (over = {}) {
  const c = {
    visible: false,
    voting: false,
    lookupId: 0,
    username: 'alice',
    proposalId: 391,
    dismissKey: 'proposal_popup_dismissed_391',
    $config: { proposalId: 391, proposalPostPath: '/@hdev/hive-dev-proposal-3' },
    $store: { dispatch: jest.fn().mockResolvedValue(false) },
    $signsInBrowser: () => true,
    $processTrxFunc: jest.fn().mockResolvedValue({ success: true }),
    $notify: jest.fn(),
    $t: (k) => k,
    ...over
  }
  for (const m of Object.keys(Comp.methods)) c[m] = Comp.methods[m].bind(c)
  return c
}

describe('components/VoteProposalModal', () => {
  beforeEach(() => localStorage.clear())

  it('shows to a logged-in user who has not voted', async () => {
    const c = ctx()
    await c.adjustVisibility()
    expect(c.$store.dispatch).toHaveBeenCalledWith('hasVotedProposal', { proposalId: 391, username: 'alice' })
    expect(c.visible).toBe(true)
  })

  it('stays hidden for voters, logged-out visitors and a failed lookup', async () => {
    const voted = ctx({ $store: { dispatch: jest.fn().mockResolvedValue(true) } })
    await voted.adjustVisibility()
    expect(voted.visible).toBe(false)

    const loggedOut = ctx({ username: null })
    await loggedOut.adjustVisibility()
    expect(loggedOut.visible).toBe(false)
    expect(loggedOut.$store.dispatch).not.toHaveBeenCalled()

    const failed = ctx({ $store: { dispatch: jest.fn().mockRejectedValue(new Error('node down')) } })
    await failed.adjustVisibility()
    expect(failed.visible).toBe(false)
  })

  it('stays hidden for 3 days after being closed', async () => {
    const c = ctx()
    c.closeModal()
    await c.adjustVisibility()
    expect(c.visible).toBe(false)
    localStorage.setItem(c.dismissKey, String(Date.now() - 4 * 24 * 60 * 60 * 1000))
    await c.adjustVisibility()
    expect(c.visible).toBe(true)
  })

  it('votes for the configured proposal with the active key', async () => {
    const c = ctx({ visible: true })
    await c.voteForProposal()
    expect(c.$processTrxFunc).toHaveBeenCalledWith('update_proposal_votes',
      { voter: 'alice', proposal_ids: [391], approve: true, extensions: [] }, true)
    expect(c.visible).toBe(false)
  })

  it('ignores a lookup that finishes after the user switched accounts', async () => {
    let finish
    const c = ctx({ $store: { dispatch: jest.fn(() => new Promise((resolve) => { finish = resolve })) } })
    const pending = c.adjustVisibility()
    c.username = 'bob'
    finish(false)
    await pending
    expect(c.visible).toBe(false)
  })

  it('only the latest of two overlapping lookups decides', async () => {
    const answers = []
    const c = ctx({ $store: { dispatch: jest.fn(() => new Promise((resolve) => answers.push(resolve))) } })
    const first = c.adjustVisibility()
    const second = c.adjustVisibility()
    answers[1](false) // latest: not voted, show
    await second
    answers[0](true) // older answer arrives late
    await first
    expect(c.visible).toBe(true)
  })

  it('remembers a successful vote so the popup does not come back', async () => {
    const c = ctx({ visible: true })
    await c.voteForProposal()
    await c.adjustVisibility()
    expect(c.visible).toBe(false)
  })

  it('a failed Keychain or HiveAuth vote keeps the popup open and says why', async () => {
    const c = ctx({ visible: true, $processTrxFunc: jest.fn().mockResolvedValue({ success: false, error: 'Missing <b>active</b> authority' }) })
    await c.voteForProposal()
    expect(c.visible).toBe(true)
    expect(c.voting).toBe(false)
    expect(c.$notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'error', text: 'Missing &lt;b&gt;active&lt;/b&gt; authority' }))
  })

  it('does not add a second message for typed-key failures, which show their own', async () => {
    const c = ctx({ visible: true, $processTrxFunc: jest.fn().mockResolvedValue({ success: false, error: 'x', cancelled: false }) })
    await c.voteForProposal()
    expect(c.$notify).not.toHaveBeenCalled()
    expect(c.visible).toBe(true)
  })

  it('sends HiveSigner users to hivesigner.com to approve the vote', async () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    const c = ctx({ visible: true, $signsInBrowser: () => false })
    await c.voteForProposal()
    expect(open).toHaveBeenCalledWith('https://hivesigner.com/sign/update-proposal-votes?proposal_ids=%5B391%5D&approve=true', '_blank')
    expect(c.$processTrxFunc).not.toHaveBeenCalled()
    open.mockRestore()
  })

  it('Read More opens the proposal post', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    ctx().readMore()
    expect(open).toHaveBeenCalledWith('/@hdev/hive-dev-proposal-3', '_blank')
    open.mockRestore()
  })
})
