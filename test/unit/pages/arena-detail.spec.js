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

  describe('mounted', () => {
    const makeCtx = (dispatch) => ({
      loading: true,
      notFound: false,
      $route: { params: { id: 'def_weekly_step_league' } },
      $store: { dispatch }
    })

    it('fetches the challenge then the standings and clears loading', async () => {
      const dispatch = jest.fn(() => Promise.resolve())
      const ctx = makeCtx(dispatch)
      await DetailPage.mounted.call(ctx)
      expect(dispatch).toHaveBeenNthCalledWith(1, 'fetchArenaChallenge', 'def_weekly_step_league')
      expect(dispatch).toHaveBeenNthCalledWith(2, 'fetchArenaStandings', 'def_weekly_step_league')
      expect(ctx.loading).toBe(false)
      expect(ctx.notFound).toBe(false)
    })

    it('sets notFound and stops when the challenge fetch fails (never calls standings)', async () => {
      const dispatch = jest.fn((action) => action === 'fetchArenaChallenge' ? Promise.reject(new Error('404')) : Promise.resolve())
      const ctx = makeCtx(dispatch)
      await DetailPage.mounted.call(ctx)
      expect(ctx.notFound).toBe(true)
      expect(ctx.loading).toBe(false)
      expect(dispatch).toHaveBeenCalledTimes(1)
    })

    it('tolerates a standings failure (challenge still renders)', async () => {
      const dispatch = jest.fn((action) => action === 'fetchArenaStandings' ? Promise.reject(new Error('boom')) : Promise.resolve())
      const ctx = makeCtx(dispatch)
      await DetailPage.mounted.call(ctx)
      expect(ctx.notFound).toBe(false)
      expect(ctx.loading).toBe(false)
    })
  })
})
