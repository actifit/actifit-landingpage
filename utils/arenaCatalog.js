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
    prizes: 'Earn Actifit Merits and a featured spot on the weekly leaderboard.'
  },
  def_daily_focus: {
    art: 'daily-focus',
    recurrence: 'Daily',
    tagline: 'Hit your daily step goal and keep your streak alive.',
    howItWorks: 'Reach the daily target to clear the challenge. It resets every day, so consistency is everything.',
    prizes: 'Collect Actifit Merits for every day you reach your goal.'
  },
  def_season_ladder: {
    art: 'season-ladder',
    recurrence: 'Seasonal',
    tagline: 'A two-week climb to the top of the ladder.',
    howItWorks: 'Your verified activity accumulates across the whole season. Finish high on the ladder to reach the podium.',
    prizes: 'Season Merits plus podium recognition for the top finishers.'
  },
  def_weekly_top_n: {
    art: 'global-top',
    recurrence: 'Weekly',
    tagline: 'Compete with the whole community to finish in the global Top-N.',
    howItWorks: 'Everyone competes on one global board. Finish among the top ranks by the end of the week.',
    prizes: 'Top finishers earn bonus Actifit Merits.'
  },
  def_weekend_warrior: {
    art: 'weekend-warrior',
    recurrence: 'Weekly',
    tagline: 'A 48-hour weekend blitz — go all out.',
    howItWorks: 'A short, high-energy sprint across the weekend. Pack in as much activity as you can before it closes.',
    prizes: 'Weekend Merits for the most active warriors.'
  },
  def_monthly_liveops: {
    art: 'monthly-event',
    recurrence: 'Monthly',
    tagline: 'A month-long event with milestones all the way to the finish.',
    howItWorks: 'Hit milestones through the month and finish strong — a marathon, not a sprint.',
    prizes: 'Milestone Merits plus a special monthly reward.'
  }
}

// Fallback copy keyed by challenge type (user-created / unknown ids).
const BY_TYPE = {
  league_fixture: {
    art: 'step-league',
    recurrence: 'League',
    tagline: 'Compete on the leaderboard and climb the table.',
    howItWorks: 'Your verified activity is ranked against everyone else in the league.',
    prizes: 'Earn Actifit Merits based on where you finish.'
  },
  daily_focus: {
    art: 'daily-focus',
    recurrence: 'Daily',
    tagline: 'Hit the daily goal and keep your streak going.',
    howItWorks: 'Reach the target each day to clear the challenge.',
    prizes: 'Earn Actifit Merits for every goal you reach.'
  },
  liveops: {
    art: 'monthly-event',
    recurrence: 'Event',
    tagline: 'A limited-time event — join before it ends.',
    howItWorks: 'A special event with its own goal and window. Take part before it closes.',
    prizes: 'Earn Actifit Merits and event rewards.'
  }
}

const DEFAULT_CATALOG = {
  art: 'step-league',
  recurrence: 'Event',
  tagline: 'Join the challenge and stay active.',
  howItWorks: 'Take part by logging your activity before the challenge window closes.',
  prizes: 'Earn Actifit Merits for taking part.'
}

// Merge the catalog entry with any real fields present on the challenge doc
// (real fields win, so a future backend that carries this copy takes over).
export function catalogFor (ch) {
  const base = (ch && (BY_ID[ch.id] || BY_TYPE[ch.type])) || DEFAULT_CATALOG
  if (!ch) return { ...base }
  return {
    art: ch.art || base.art,
    recurrence: ch.recurrence || base.recurrence,
    tagline: ch.tagline || ch.description || base.tagline,
    howItWorks: ch.how_it_works || ch.description || base.howItWorks,
    prizes: (ch.rewards && ch.rewards.summary) || ch.prize_summary || base.prizes
  }
}

export function artUrl (ch) {
  // Prefer the challenge's own art key (now carried on the doc — Trello #182);
  // fall back to the local id/type catalog, then the default.
  const art = (ch && ch.art) || ((ch && (BY_ID[ch.id] || BY_TYPE[ch.type])) || DEFAULT_CATALOG).art
  return IMG_BASE + art + '.webp'
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
