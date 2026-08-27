import Comp from '~/components/ActifitterOfMonth.vue'

// Exercise computed/methods/lifecycle against a mocked `this`, per repo convention.
const ctx = (over = {}) => ({
  featuredActifitter: { username: 'jane', display_name: 'Jane Doe', stats: {} },
  $t: (k) => k,
  fmtNum: Comp.methods.fmtNum,
  ...over
})

describe('components/ActifitterOfMonth', () => {
  describe('photo', () => {
    it('uses the editorial photo when present', () => {
      const c = ctx({ featuredActifitter: { username: 'jane', photo_url: 'https://x/y.jpg' } })
      expect(Comp.computed.photo.call(c)).toBe('https://x/y.jpg')
    })
    it('falls back to the Hive avatar when no photo', () => {
      const c = ctx({ featuredActifitter: { username: 'jane' } })
      expect(Comp.computed.photo.call(c)).toBe('https://images.hive.blog/u/jane/avatar')
    })
  })

  describe('displayName', () => {
    it('prefers display_name, falls back to username', () => {
      expect(Comp.computed.displayName.call(ctx({ featuredActifitter: { username: 'jane', display_name: 'Jane' } }))).toBe('Jane')
      expect(Comp.computed.displayName.call(ctx({ featuredActifitter: { username: 'bob' } }))).toBe('bob')
    })
  })

  describe('statChips', () => {
    it('renders only present, finite stats with formatting', () => {
      const c = ctx({ featuredActifitter: { username: 'jane', stats: { rank: 12, afit: 15400, activity_count: 'bad' } } })
      const chips = Comp.computed.statChips.call(c)
      const byKey = Object.fromEntries(chips.map(ch => [ch.key, ch.value]))
      expect(byKey.rank).toBe('#12')
      expect(byKey.afit).toBe((15400).toLocaleString())
      expect(byKey.activity_count).toBeUndefined() // non-finite dropped
      expect('months_active' in byKey).toBe(false) // absent dropped
    })
    it('is empty when there are no stats', () => {
      expect(Comp.computed.statChips.call(ctx())).toEqual([])
    })
  })

  describe('ctaText', () => {
    it('uses the editorial cta, else the i18n fallback', () => {
      expect(Comp.computed.ctaText.call(ctx({ featuredActifitter: { username: 'j', cta: 'Join Jane!' } }))).toBe('Join Jane!')
      expect(Comp.computed.ctaText.call(ctx())).toBe('Actifitter_Month_CTA')
    })
  })

  describe('monthLabel', () => {
    it('formats YYYY-MM and passes odd values through', () => {
      expect(Comp.computed.monthLabel.call(ctx({ featuredActifitter: { username: 'j', month: '2026-08' } }))).toMatch(/2026/)
      expect(Comp.computed.monthLabel.call(ctx({ featuredActifitter: { username: 'j', month: 'Summer' } }))).toBe('Summer')
      expect(Comp.computed.monthLabel.call(ctx({ featuredActifitter: { username: 'j' } }))).toBe('')
    })
  })

  describe('mounted', () => {
    it('dispatches fetchFeaturedActifitter', () => {
      const dispatch = jest.fn()
      Comp.mounted.call({ $store: { dispatch } })
      expect(dispatch).toHaveBeenCalledWith('fetchFeaturedActifitter')
    })
  })
})
