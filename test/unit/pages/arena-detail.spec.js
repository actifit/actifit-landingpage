import DetailPage from '~/pages/arena/_id.vue'

describe('pages/arena/_id (detail)', () => {
  const challenge = { id: 'def_weekly_step_league', type: 'league_fixture', state: 'open', title: 'Weekly Step League', scoring: { metric: 'activity_count' }, window: { start: '2026-08-27T00:00:00Z', end: '2026-09-03T00:00:00Z' } }

  describe('computed', () => {
    // `ch` is itself a computed; when unit-calling other computeds that read
    // `this.ch` we supply it directly (Vue would resolve it in a real instance).
    const ctx = (overrides = {}) => ({ arenaChallenge: { challenge }, arenaStandings: null, ch: challenge, ...overrides })

    it('ch pulls the challenge out of the wrapper', () => {
      expect(DetailPage.computed.ch.call(ctx())).toBe(challenge)
    })
    it('rows returns [] when no standings, the rows array otherwise', () => {
      expect(DetailPage.computed.rows.call(ctx())).toEqual([])
      const rows = [{ entity: 'alice', rank: 1, score: 50 }]
      expect(DetailPage.computed.rows.call(ctx({ arenaStandings: { rows } }))).toBe(rows)
    })
    it('derives duration, start/end and scoredBy from the challenge', () => {
      const c = ctx()
      expect(DetailPage.computed.duration.call(c)).toBe('7 days')
      expect(DetailPage.computed.starts.call(c)).not.toBe('')
      expect(DetailPage.computed.ends.call(c)).not.toBe('')
      expect(DetailPage.computed.scoredBy.call(c)).toBe('total activity')
    })
    it('cat exposes catalog copy for the challenge', () => {
      const c = ctx()
      // `cat` reads `this.ch`, so provide it
      const withCh = { ...c, ch: challenge }
      expect(DetailPage.computed.cat.call(withCh).recurrence).toBe('Weekly')
    })
  })

  describe('asyncData (server-side fetch)', () => {
    const makeStore = (dispatch) => ({ dispatch, commit: jest.fn() })
    const params = { id: 'def_weekly_step_league' }

    it('resets standings, fetches the challenge then the standings, notFound=false', async () => {
      const dispatch = jest.fn(() => Promise.resolve())
      const store = makeStore(dispatch)
      const result = await DetailPage.asyncData({ store, params })
      expect(store.commit).toHaveBeenCalledWith('setArenaStandings', null) // reset first — no stale-board leak
      expect(dispatch).toHaveBeenNthCalledWith(1, 'fetchArenaChallenge', params.id)
      expect(dispatch).toHaveBeenNthCalledWith(2, 'fetchArenaStandings', params.id)
      expect(result).toEqual({ notFound: false })
    })

    it('sets notFound and never fetches standings when the challenge fetch fails', async () => {
      const dispatch = jest.fn((action) => action === 'fetchArenaChallenge' ? Promise.reject(new Error('404')) : Promise.resolve())
      const store = makeStore(dispatch)
      const result = await DetailPage.asyncData({ store, params })
      expect(result).toEqual({ notFound: true })
      expect(store.commit).toHaveBeenCalledWith('setArenaChallenge', null)
      expect(dispatch).toHaveBeenCalledTimes(1)
    })

    it('tolerates a standings failure and clears standings (challenge still renders)', async () => {
      const dispatch = jest.fn((action) => action === 'fetchArenaStandings' ? Promise.reject(new Error('boom')) : Promise.resolve())
      const store = makeStore(dispatch)
      const result = await DetailPage.asyncData({ store, params })
      expect(result).toEqual({ notFound: false })
      // committed null once at the start and again in the catch
      expect(store.commit.mock.calls.filter(c => c[0] === 'setArenaStandings' && c[1] === null).length).toBe(2)
    })
  })

  describe('participation (#181)', () => {
    const loggedIn = { account: { name: 'alice' } }

    it('isLoggedIn / myUsername reflect the steemconnect user', () => {
      expect(DetailPage.computed.isLoggedIn.call({ user: loggedIn })).toBe(true)
      expect(DetailPage.computed.isLoggedIn.call({ user: null })).toBe(false)
      expect(DetailPage.computed.myUsername.call({ user: loggedIn, isLoggedIn: true })).toBe('alice')
    })

    it('serverJoined is true only for a non-left participant row of mine', () => {
      const base = { myUsername: 'alice' }
      expect(DetailPage.computed.serverJoined.call({ ...base, participants: [{ entity: 'alice', state: 'enrolled' }] })).toBe(true)
      expect(DetailPage.computed.serverJoined.call({ ...base, participants: [{ entity: 'alice', state: 'left' }] })).toBe(false)
      expect(DetailPage.computed.serverJoined.call({ ...base, participants: [{ entity: 'bob', state: 'enrolled' }] })).toBe(false)
    })

    it('joined prefers the optimistic localJoined override', () => {
      expect(DetailPage.computed.joined.call({ localJoined: null, serverJoined: true })).toBe(true)
      expect(DetailPage.computed.joined.call({ localJoined: false, serverJoined: true })).toBe(false)
      expect(DetailPage.computed.joined.call({ localJoined: true, serverJoined: false })).toBe(true)
    })

    it('joinable only for open/active challenges', () => {
      expect(DetailPage.computed.joinable.call({ ch: { state: 'open' } })).toBe(true)
      expect(DetailPage.computed.joinable.call({ ch: { state: 'active' } })).toBe(true)
      expect(DetailPage.computed.joinable.call({ ch: { state: 'settled' } })).toBe(false)
    })

    it('meritBalance reads the fetched balance, defaults to 0', () => {
      expect(DetailPage.computed.meritBalance.call({ arenaMerits: { balance: 240 } })).toBe(240)
      expect(DetailPage.computed.meritBalance.call({ arenaMerits: null })).toBe(0)
    })

    it('arenaOp builds a signed actifit_arena custom_json for the challenge', () => {
      const op = DetailPage.methods.arenaOp.call({ myUsername: 'alice', ch: challenge }, 'join')
      expect(op.id).toBe('actifit_arena')
      expect(op.required_posting_auths).toEqual(['alice'])
      expect(op.required_auths).toEqual([])
      expect(JSON.parse(op.json)).toEqual({ op: 'join', v: 1, challenge_id: 'def_weekly_step_league' })
    })

    it('joinChallenge broadcasts and optimistically marks joined on success', async () => {
      const $processTrxFunc = jest.fn().mockResolvedValue({ success: true })
      const ctx = { isLoggedIn: true, acting: false, ch: challenge, myUsername: 'alice', localJoined: null, actionMsg: '', $t: (k) => k, $processTrxFunc }
      ctx.arenaOp = DetailPage.methods.arenaOp.bind(ctx)
      ctx.broadcastArenaOp = DetailPage.methods.broadcastArenaOp.bind(ctx)
      await DetailPage.methods.joinChallenge.call(ctx)
      expect($processTrxFunc).toHaveBeenCalledWith('custom_json', expect.objectContaining({ id: 'actifit_arena' }), false)
      expect(ctx.localJoined).toBe(true)
      expect(ctx.actionMsg).toBe('Arena_Join_Pending')
    })

    it('joinChallenge surfaces an error and does not mark joined on failure', async () => {
      const $processTrxFunc = jest.fn().mockResolvedValue({ success: false })
      const ctx = { isLoggedIn: true, acting: false, ch: challenge, myUsername: 'alice', localJoined: null, actionMsg: '', $t: (k) => k, $processTrxFunc }
      ctx.arenaOp = DetailPage.methods.arenaOp.bind(ctx)
      ctx.broadcastArenaOp = DetailPage.methods.broadcastArenaOp.bind(ctx)
      await DetailPage.methods.joinChallenge.call(ctx)
      expect(ctx.localJoined).toBe(null)
      expect(ctx.actionMsg).toBe('Arena_Action_Failed')
    })

    it('leaveChallenge optimistically marks left on success', async () => {
      const $processTrxFunc = jest.fn().mockResolvedValue({ success: true })
      const ctx = { isLoggedIn: true, acting: false, ch: challenge, myUsername: 'alice', localJoined: true, actionMsg: '', $t: (k) => k, $processTrxFunc }
      ctx.arenaOp = DetailPage.methods.arenaOp.bind(ctx)
      ctx.broadcastArenaOp = DetailPage.methods.broadcastArenaOp.bind(ctx)
      await DetailPage.methods.leaveChallenge.call(ctx)
      expect(JSON.parse($processTrxFunc.mock.calls[0][1].json).op).toBe('leave')
      expect(ctx.localJoined).toBe(false)
    })
  })
})
