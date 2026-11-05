// Arena: the badge says "Upcoming" before a challenge starts, "Ending soon" in its
// last day, and a live countdown says how long is left. Prize text for the official
// contests carries the real amounts (actifit-bot arena_rewards.js).
import { displayState, countdownFor, formatCountdown, catalogFor } from '~/utils/arenaCatalog'
import arenaClock from '~/mixins/arenaClock'

const H = 3600000
const D = 24 * H
const NOW = Date.parse('2026-11-05T12:00:00Z')
const win = (startOffset, endOffset) => ({
  start: new Date(NOW + startOffset).toISOString(),
  end: new Date(NOW + endOffset).toISOString()
})

describe('displayState', () => {
  it('is "upcoming" before the window starts, even though the engine stores "open"', () => {
    expect(displayState({ state: 'open', window: win(D, 3 * D) }, NOW)).toBe('upcoming')
  })
  it('is "ending_soon" for an open challenge in its last 24 hours', () => {
    expect(displayState({ state: 'open', window: win(-D, 5 * H) }, NOW)).toBe('ending_soon')
  })
  it('is the stored state otherwise', () => {
    expect(displayState({ state: 'open', window: win(-D, 3 * D) }, NOW)).toBe('open')
    expect(displayState({ state: 'settled', window: win(-3 * D, -D) }, NOW)).toBe('settled')
    expect(displayState({ state: 'active', window: win(-D, H) }, NOW)).toBe('active')
    expect(displayState({ state: 'open' }, NOW)).toBe('open')
    expect(displayState(null, NOW)).toBe('')
  })
})

describe('countdown', () => {
  it('formats days+hours, hours+minutes, minutes+seconds', () => {
    expect(formatCountdown(2 * D + 4 * H + 59000)).toBe('2d 4h')
    expect(formatCountdown(5 * H + 12 * 60000 + 30000)).toBe('5h 12m')
    expect(formatCountdown(12 * 60000 + 5000)).toBe('12m 5s')
    expect(formatCountdown(0)).toBe('')
    expect(formatCountdown(NaN)).toBe('')
  })
  it('counts to the start, then to the end, then stops', () => {
    expect(countdownFor({ window: win(2 * D + 4 * H, 4 * D) }, NOW)).toEqual({ kind: 'starts', text: '2d 4h' })
    expect(countdownFor({ window: win(-D, 5 * H + 12 * 60000) }, NOW)).toEqual({ kind: 'ends', text: '5h 12m' })
    expect(countdownFor({ window: win(-3 * D, -D) }, NOW)).toBe(null)
    expect(countdownFor({}, NOW)).toBe(null)
  })
})

describe('arenaClock mixin', () => {
  const vm = (now) => {
    const o = { now, $t: (k) => k }
    Object.keys(arenaClock.methods).forEach(k => { o[k] = arenaClock.methods[k].bind(o) })
    return o
  }
  const ch = { state: 'open', window: win(D + 2 * H, 3 * D) }

  it('shows no countdown before mount (server render), so hydration cannot mismatch', () => {
    expect(vm(null).arenaCountdown(ch)).toBe('')
  })
  it('labels the state and the countdown', () => {
    expect(vm(NOW).arenaStateLabel(ch)).toBe('Arena_State_Upcoming')
    expect(vm(NOW).arenaCountdown(ch)).toBe('Arena_Starts_In 1d 2h')
    expect(vm(NOW).arenaStateLabel({ state: 'league_fixture_done' })).toBe('league fixture done')
  })
  it('starts one timer in mounted and clears it on destroy', () => {
    jest.useFakeTimers()
    const o = { now: null, clockTimer: null }
    arenaClock.mounted.call(o)
    expect(o.now).not.toBe(null)
    const id = o.clockTimer
    const spy = jest.spyOn(global, 'clearInterval')
    arenaClock.beforeDestroy.call(o)
    expect(spy).toHaveBeenCalledWith(id)
    spy.mockRestore()
    jest.useRealTimers()
  })
})

describe('official contest prizes', () => {
  const official = (id, extra = {}) => ({ id: id + '@2026-11-04', parent_id: id, origin_tier: 'official', prize_summary: 'Collect AFIT for every day you reach your goal.', ...extra })

  it('Daily Focus shows its 50 AFIT prize and the live step target', () => {
    const c = catalogFor(official('def_daily_focus', { scoring: { metric: 'goal_hit', rule: 'threshold', threshold: 5000 } }))
    expect(c.prizes).toBe('50 AFIT to everyone who reaches 5,000 steps in the day.')
  })
  it('the ranked contests list their amounts', () => {
    expect(catalogFor(official('def_weekend_warrior')).prizes).toMatch(/^1st: 50 AFIT, 2nd: 35 AFIT, 3rd: 25 AFIT\. .* 8 AFIT\.$/)
    expect(catalogFor(official('def_weekly_top_n')).prizes).toMatch(/4th to 10th: 25 AFIT each/)
  })
  it('a user challenge cannot borrow the official prize text through parent_id', () => {
    const c = catalogFor({ id: 'mine', parent_id: 'def_daily_focus', origin_tier: 'friendly', prize_summary: 'My prize' })
    expect(c.prizes).toBe('My prize')
  })
  it('a real rewards summary from the API still wins', () => {
    expect(catalogFor(official('def_daily_focus', { rewards: { summary: 'From the API' } })).prizes).toBe('From the API')
  })
})
