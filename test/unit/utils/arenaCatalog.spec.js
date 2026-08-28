import { catalogFor, artUrl, formatDuration, formatDate, scoredByLabel, humanize } from '@/utils/arenaCatalog'

describe('utils/arenaCatalog', () => {
  describe('catalogFor', () => {
    it('returns per-id copy for a known default contest', () => {
      const c = catalogFor({ id: 'def_weekly_step_league', type: 'league_fixture' })
      expect(c.recurrence).toBe('Weekly')
      expect(c.tagline).toMatch(/weekly leaderboard/i)
      expect(c.prizes).toMatch(/Merits/)
    })

    it('falls back to type copy for an unknown id', () => {
      const c = catalogFor({ id: 'user_made_123', type: 'liveops' })
      expect(c.recurrence).toBe('Event')
      expect(c.tagline).toBeTruthy()
    })

    it('falls back to a safe default for an unknown type', () => {
      const c = catalogFor({ id: 'x', type: 'something_new' })
      expect(c.tagline).toBeTruthy()
      expect(c.prizes).toMatch(/Merits/)
    })

    it('prefers real fields on the challenge over catalog copy', () => {
      const c = catalogFor({ id: 'def_daily_focus', type: 'daily_focus', description: 'Custom copy', recurrence: 'Fortnightly' })
      expect(c.tagline).toBe('Custom copy')
      expect(c.recurrence).toBe('Fortnightly')
    })

    it('is safe on null', () => {
      expect(catalogFor(null).tagline).toBeTruthy()
    })
  })

  describe('artUrl', () => {
    it('maps a known id to its webp banner', () => {
      expect(artUrl({ id: 'def_global? ' })).toBe('/img/arena/step-league.webp') // unknown -> default
      expect(artUrl({ id: 'def_weekly_top_n', type: 'liveops' })).toBe('/img/arena/global-top.webp')
    })
  })

  describe('formatDuration', () => {
    const win = (days) => ({ start: '2026-01-01T00:00:00Z', end: new Date(Date.UTC(2026, 0, 1 + days)).toISOString() })
    it('formats single day, days, weeks and months', () => {
      expect(formatDuration(win(1))).toBe('1 day')
      expect(formatDuration(win(7))).toBe('7 days')
      expect(formatDuration(win(14))).toBe('2 weeks')
      expect(formatDuration(win(30))).toBe('1 month')
    })
    it('returns empty string for a missing/invalid window', () => {
      expect(formatDuration(null)).toBe('')
      expect(formatDuration({ start: 'x', end: 'y' })).toBe('')
      expect(formatDuration({ start: '2026-01-02T00:00:00Z', end: '2026-01-01T00:00:00Z' })).toBe('')
    })
  })

  describe('scoredByLabel', () => {
    it('maps known metrics to friendly labels', () => {
      expect(scoredByLabel({ scoring: { metric: 'activity_count' } })).toBe('total activity')
      expect(scoredByLabel({ scoring: { metric: 'goal_hit' } })).toBe('daily goal hits')
    })
    it('humanizes an unknown metric and defaults when absent', () => {
      expect(scoredByLabel({ scoring: { metric: 'floors_climbed' } })).toBe('floors climbed')
      expect(scoredByLabel({})).toBe('activity')
    })
  })

  describe('humanize / formatDate', () => {
    it('humanize swaps underscores and passes non-strings through', () => {
      expect(humanize('league_fixture')).toBe('league fixture')
      expect(humanize(undefined)).toBe(undefined)
    })
    it('formatDate never returns "Invalid Date"', () => {
      expect(formatDate('garbage')).toBe('')
      expect(formatDate('2026-08-26T00:00:00Z')).not.toBe('')
    })
  })
})
