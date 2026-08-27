import ArenaPage from '~/pages/arena/index.vue'

// Follows the repo convention: exercise methods / lifecycle hooks against a
// mocked `this` context rather than a full mount.
describe('pages/arena (discovery)', () => {
  const ch = { id: 'def_weekly_step_league', type: 'league_fixture', state: 'open', title: 'Weekly Step League', window: { start: '2026-08-27T00:00:00Z', end: '2026-09-03T00:00:00Z' } }

  describe('presentation methods', () => {
    it('humanize turns a machine enum into a readable label', () => {
      expect(ArenaPage.methods.humanize('league_fixture')).toBe('league fixture')
    })
    it('artUrl resolves the challenge banner', () => {
      expect(ArenaPage.methods.artUrl(ch)).toBe('/img/arena/step-league.webp')
    })
    it('cat exposes catalog copy (tagline/prizes/recurrence)', () => {
      const c = ArenaPage.methods.cat(ch)
      expect(c.recurrence).toBe('Weekly')
      expect(c.tagline).toBeTruthy()
      expect(c.prizes).toMatch(/Merits/)
    })
    it('duration derives a humanized window length', () => {
      expect(ArenaPage.methods.duration(ch)).toBe('7 days')
    })
    it('ends formats the window end, empty for a bad date', () => {
      expect(ArenaPage.methods.ends(ch)).not.toBe('')
      expect(ArenaPage.methods.ends({ window: { end: 'garbage' } })).toBe('')
    })
  })

  describe('data + mounted', () => {
    it('starts in the loading state', () => {
      expect(ArenaPage.data().loading).toBe(true)
    })
    it('dispatches fetchArenaChallenges(state:open) and clears loading on success', async () => {
      const context = { loading: true, $store: { dispatch: jest.fn(() => Promise.resolve([])) } }
      await ArenaPage.mounted.call(context)
      expect(context.$store.dispatch).toHaveBeenCalledWith('fetchArenaChallenges', { state: 'open' })
      expect(context.loading).toBe(false)
    })
    it('clears loading even when the dispatch rejects (falls through to the empty state)', async () => {
      const context = { loading: true, $store: { dispatch: jest.fn(() => Promise.reject(new Error('api down'))) } }
      await ArenaPage.mounted.call(context)
      expect(context.loading).toBe(false)
    })
  })
})
