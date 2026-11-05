/**
 * Presentation catalog for Arena challenges.
 *
 * The challenge documents returned by the engine API are intentionally lean
 * (type, title, window, scoring, entry). Rich promotional copy — tagline,
 * how-it-works, prize summary, recurrence and the hero image — lives here on
 * the web side for now. This is deliberate tech debt: the canonical copy should
 * later move onto the challenge document so Android/iOS share it (tracked in
 * actifit-bot CLAUDE.md). Until then, everything renders through catalogFor(),
 * which prefers real fields on the challenge and falls back to this catalog.
 *
 * Hero images are generated banners under static/img/arena/<art>.webp.
 */

const IMG_BASE = '/img/arena/'

// Per-id copy for the six official default contests.
const BY_ID = {
  def_weekly_step_league: {
    art: 'step-league',
    recurrence: 'Weekly',
    tagline: 'Climb the weekly leaderboard by staying active every day.',
    howItWorks: 'Every activity you log during the week counts toward your score. The most active members rise to the top of the league table.',
    prizes: 'Earn AFIT and a featured spot on the weekly leaderboard.'
  },
  def_daily_focus: {
    art: 'daily-focus',
    recurrence: 'Daily',
    tagline: 'Hit your daily step goal and keep your streak alive.',
    howItWorks: 'Reach the daily target to clear the challenge. It resets every day, so consistency is everything.',
    prizes: 'Collect AFIT for every day you reach your goal.'
  },
  def_season_ladder: {
    art: 'season-ladder',
    recurrence: 'Seasonal',
    tagline: 'A two-week climb to the top of the ladder.',
    howItWorks: 'Your verified activity accumulates across the whole season. Finish high on the ladder to reach the podium.',
    prizes: 'Season AFIT rewards plus podium recognition for the top finishers.'
  },
  def_weekly_top_n: {
    art: 'global-top',
    recurrence: 'Weekly',
    tagline: 'Compete with the whole community to finish in the global Top-N.',
    howItWorks: 'Everyone competes on one global board. Finish among the top ranks by the end of the week.',
    prizes: 'Top finishers earn bonus AFIT.'
  },
  def_weekend_warrior: {
    art: 'weekend-warrior',
    recurrence: 'Weekly',
    tagline: 'A 48-hour weekend blitz — go all out.',
    howItWorks: 'A short, high-energy sprint across the weekend. Pack in as much activity as you can before it closes.',
    prizes: 'Weekend AFIT rewards for the most active warriors.'
  },
  def_monthly_liveops: {
    art: 'monthly-event',
    recurrence: 'Monthly',
    tagline: 'A month-long event with milestones all the way to the finish.',
    howItWorks: 'Hit milestones through the month and finish strong — a marathon, not a sprint.',
    prizes: 'Milestone AFIT rewards plus a special monthly reward.'
  }
}

// Exact prize text for the official contests, from actifit-bot arena_rewards.js
// SCHEDULES. The API sends rewards: null and a generic prize_summary for these, so
// without this the page never said what a contest pays. Only finishers with a
// verified score above 0 are paid. Remove once the API carries the amounts.
const OFFICIAL_PRIZES = {
  def_daily_focus: (ch) => {
    const t = ch && ch.scoring && Number(ch.scoring.threshold)
    return t > 0
      ? `50 AFIT to everyone who reaches ${t.toLocaleString('en-US')} steps in the day.`
      : '50 AFIT to everyone who reaches the daily step goal.'
  },
  def_weekly_step_league: () => '1st: 100 AFIT, 2nd: 60 AFIT, 3rd: 40 AFIT. Every other finisher with activity earns 10 AFIT.',
  def_season_ladder: () => '1st: 250 AFIT, 2nd: 150 AFIT, 3rd: 100 AFIT. Every other finisher with activity earns 20 AFIT.',
  def_weekly_top_n: () => '1st: 80 AFIT, 2nd: 60 AFIT, 3rd: 45 AFIT, 4th to 10th: 25 AFIT each. Every other finisher with activity earns 10 AFIT.',
  def_weekend_warrior: () => '1st: 50 AFIT, 2nd: 35 AFIT, 3rd: 25 AFIT. Every other finisher with activity earns 8 AFIT.',
  def_monthly_liveops: () => '1st: 400 AFIT, 2nd: 250 AFIT, 3rd: 150 AFIT. Every other finisher with activity earns 25 AFIT.'
}

// Only a challenge the official account created pays the schedule; a user challenge
// can name a def_* parent_id, so the id alone is not enough.
function officialPrizes (ch) {
  if (!ch || ch.origin_tier !== 'official') return ''
  const fn = OFFICIAL_PRIZES[ch.parent_id] || OFFICIAL_PRIZES[ch.id]
  return fn ? fn(ch) : ''
}

// Fallback copy keyed by challenge type (user-created / unknown ids).
const BY_TYPE = {
  league_fixture: {
    art: 'step-league',
    recurrence: 'League',
    tagline: 'Compete on the leaderboard and climb the table.',
    howItWorks: 'Your verified activity is ranked against everyone else in the league.',
    prizes: 'Earn AFIT based on where you finish.'
  },
  daily_focus: {
    art: 'daily-focus',
    recurrence: 'Daily',
    tagline: 'Hit the daily goal and keep your streak going.',
    howItWorks: 'Reach the target each day to clear the challenge.',
    prizes: 'Earn AFIT for every goal you reach.'
  },
  liveops: {
    art: 'monthly-event',
    recurrence: 'Event',
    tagline: 'A limited-time event — join before it ends.',
    howItWorks: 'A special event with its own goal and window. Take part before it closes.',
    prizes: 'Earn AFIT and event rewards.'
  }
}

const DEFAULT_CATALOG = {
  art: 'step-league',
  recurrence: 'Event',
  tagline: 'Join the challenge and stay active.',
  howItWorks: 'Take part by logging your activity before the challenge window closes.',
  prizes: 'Earn AFIT for taking part.'
}

// A recurring default rolls forward under a NEW id (e.g. def_weekly_step_league@
// 2026-09-11) that chains to the original via parent_id — so resolve the catalog
// by parent_id first, then id, then type.
function baseEntry (ch) {
  return (ch && (BY_ID[ch.id] || BY_ID[ch.parent_id] || BY_TYPE[ch.type])) || DEFAULT_CATALOG
}

// Merge the catalog entry with any real fields present on the challenge doc
// (real fields win, so the backend that now carries this copy — #182, and rolled
// recurrence instances that copy it forward — takes over).
export function catalogFor (ch) {
  const base = baseEntry(ch)
  if (!ch) return { ...base }
  return {
    art: ch.art || base.art,
    recurrence: ch.recurrence || base.recurrence,
    tagline: ch.tagline || ch.description || base.tagline,
    howItWorks: ch.how_it_works || ch.description || base.howItWorks,
    prizes: (ch.rewards && ch.rewards.summary) || officialPrizes(ch) || ch.prize_summary || base.prizes
  }
}

export function artUrl (ch) {
  const c = baseEntry(ch)
  return IMG_BASE + ((ch && ch.art) || c.art) + '.webp'
}

// What the challenge is scored on — human label for scoring.metric.
const METRIC_LABELS = {
  activity_count: 'total activity',
  goal_hit: 'daily goal hits',
  steps: 'step count',
  distance: 'distance'
}
export function scoredByLabel (ch) {
  const m = ch && ch.scoring && ch.scoring.metric
  if (!m) return 'activity'
  return METRIC_LABELS[m] || String(m).replace(/_/g, ' ')
}

// Humanized window length, e.g. "1 day", "7 days", "2 weeks", "1 month".
export function formatDuration (win) {
  if (!win || !win.start || !win.end) return ''
  const ms = new Date(win.end).getTime() - new Date(win.start).getTime()
  if (!isFinite(ms) || ms <= 0) return ''
  const days = Math.round(ms / 86400000)
  if (days <= 1) return '1 day'
  if (days < 14) return days + ' days'
  if (days < 28) {
    const weeks = Math.round(days / 7)
    return weeks + (weeks === 1 ? ' week' : ' weeks')
  }
  const months = Math.round(days / 30)
  return months + (months === 1 ? ' month' : ' months')
}

// Machine enum → readable label (league_fixture → "league fixture").
export function humanize (s) {
  return typeof s === 'string' ? s.replace(/_/g, ' ') : s
}

// Locale date (guards "Invalid Date").
export function formatDate (iso) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
}

const HOUR = 3600000
const DAY = 24 * HOUR

function windowMs (ch) {
  const w = ch && ch.window
  if (!w) return null
  const start = new Date(w.start).getTime()
  const end = new Date(w.end).getTime()
  return { start: isFinite(start) ? start : null, end: isFinite(end) ? end : null }
}

// The state to SHOW. The engine stores 'open' for a challenge whose window has not
// started yet (it can be joined early), so 'open' alone read as "running now".
// Returns 'upcoming', 'ending_soon' or the stored state.
export function displayState (ch, now = Date.now()) {
  if (!ch) return ''
  const w = windowMs(ch)
  if (w && w.start !== null && now < w.start) return 'upcoming'
  if (ch.state === 'open' && w && w.end !== null && w.end > now && w.end - now < DAY) return 'ending_soon'
  return ch.state
}

// "2d 4h", "5h 12m", "12m 5s".
export function formatCountdown (ms) {
  if (!isFinite(ms) || ms <= 0) return ''
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s % 60}s`
}

// What the countdown chip says: { kind: 'starts' | 'ends', text }, or null once the
// window is over or unknown.
export function countdownFor (ch, now = Date.now()) {
  const w = windowMs(ch)
  if (!w) return null
  if (w.start !== null && now < w.start) return { kind: 'starts', text: formatCountdown(w.start - now) }
  if (w.end !== null && now < w.end) return { kind: 'ends', text: formatCountdown(w.end - now) }
  return null
}
