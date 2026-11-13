import { parseUtc, timeAgo } from '~/utils/timeAgo'

const NOW = Date.parse('2026-10-30T16:46:00Z')

describe('timeAgo', () => {
  it('reads an Actifit API date (with Z) at its real age', () => {
    expect(timeAgo('2026-10-30T16:42:36.966Z', NOW)).toBe('3 min(s) ago')
  })

  it('reads a Hive chain timestamp (no zone) as UTC', () => {
    expect(timeAgo('2026-10-30T16:39:30', NOW)).toBe('6 min(s) ago')
  })

  it('gives the same answer in any viewer time zone', () => {
    // parseUtc never depends on the local zone, so both forms agree
    expect(parseUtc('2026-10-30T16:39:30')).toBe(Date.parse('2026-10-30T16:39:30Z'))
    expect(parseUtc('2026-10-30T18:39:30+02:00')).toBe(Date.parse('2026-10-30T16:39:30Z'))
  })

  it('reads a space-separated date-time and epoch milliseconds', () => {
    expect(parseUtc('2026-10-30 16:39:30')).toBe(Date.parse('2026-10-30T16:39:30Z'))
    expect(timeAgo(NOW - 10 * 60000, NOW)).toBe('10 min(s) ago')
  })

  it('steps through hours, days, weeks, months and years', () => {
    expect(timeAgo('2026-10-30T13:46:00Z', NOW)).toBe('3 hour(s) ago')
    expect(timeAgo('2026-10-27T16:46:00Z', NOW)).toBe('3 day(s) ago')
    expect(timeAgo('2026-10-16T16:46:00Z', NOW)).toBe('2 week(s) ago')
    expect(timeAgo('2026-07-30T16:46:00Z', NOW)).toBe('3 month(s) ago')
    expect(timeAgo('2024-10-30T16:46:00Z', NOW)).toBe('2 year(s) ago')
  })

  it('accepts Date objects and returns empty text for unreadable input', () => {
    expect(timeAgo(new Date(NOW - 5 * 60000), NOW)).toBe('5 min(s) ago')
    expect(timeAgo(undefined, NOW)).toBe('')
    expect(timeAgo('not a date', NOW)).toBe('')
  })
})
