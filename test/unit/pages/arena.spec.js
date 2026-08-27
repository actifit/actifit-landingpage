import ArenaPage from '~/pages/arena/index.vue'

// Follows the repo convention: exercise methods / lifecycle hooks against a
// mocked `this` context rather than a full mount.
describe('pages/arena', () => {
  describe('humanize', () => {
    it('turns a machine enum into a readable label', () => {
      expect(ArenaPage.methods.humanize('league_fixture')).toBe('league fixture')
      expect(ArenaPage.methods.humanize('liveops')).toBe('liveops')
    })
    it('passes non-strings through unchanged', () => {
      expect(ArenaPage.methods.humanize(undefined)).toBe(undefined)
      expect(ArenaPage.methods.humanize(null)).toBe(null)
    })
  })

  describe('formatDate', () => {
    it('formats a valid ISO date', () => {
      expect(ArenaPage.methods.formatDate('2026-08-26T00:00:00Z')).not.toBe('')
    })
    it('returns an empty string for a missing/malformed date (never "Invalid Date")', () => {
      expect(ArenaPage.methods.formatDate('garbage')).toBe('')
      expect(ArenaPage.methods.formatDate(undefined)).toBe('')
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
