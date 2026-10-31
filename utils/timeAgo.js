/**
 * "5 min(s) ago" style labels ($getTimeDifference in plugins/vue-custom.js).
 *
 * Dates come in two forms: Hive chain timestamps, which are UTC without a zone suffix
 * ("2026-10-30T16:39:30"), and Actifit API dates, which carry one ("...Z"). A date without
 * a zone is read as UTC; reading it as local time shifted every label by the viewer's
 * time zone offset.
 */

export function parseUtc (value) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value !== 'string' || !value) return NaN
  // "2026-10-30 16:39:30" (space) is the same date-time as "2026-10-30T16:39:30"
  const text = /^\d{4}-\d\d-\d\d \d/.test(value) ? value.replace(' ', 'T') : value
  const hasZone = /([zZ]|[+-]\d\d(:?\d\d)?)$/.test(text)
  const isDateTime = /T/i.test(text)
  return Date.parse(isDateTime && !hasZone ? text + 'Z' : text)
}

export function timeAgo (value, now = Date.now()) {
  const at = parseUtc(value)
  if (Number.isNaN(at)) return ''
  const difference = Math.abs(now - at)
  const mins = Math.floor(difference / (1000 * 60))
  const hours = Math.floor(difference / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(weeks / 4)
  const years = Math.floor(months / 12)

  if (mins < 60) return `${mins} min(s) ago`
  if (hours < 24) return `${hours} hour(s) ago`
  if (days < 7) return `${days} day(s) ago`
  if (weeks < 4) return `${weeks} week(s) ago`
  if (months < 12) return `${months} month(s) ago`
  return `${years} year(s) ago`
}
