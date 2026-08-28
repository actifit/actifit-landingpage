// House-rule guard (no gambling / pay-to-win / purchase-to-win): the Arena's
// user-facing reward copy must read as earned Merits, sponsor-funded. This test
// pins that so a well-meaning copy edit can't quietly reintroduce wagering
// language. See the compliance invariants in actifit-bot.
const en = require('@/lang/en_US')
import { catalogFor } from '@/utils/arenaCatalog'

const FORBIDDEN = /\b(buy|purchase|deposit|wager|bet|betting|stake|gamble|gambling|pay-to-win|pay to win|jackpot|raffle|lottery)\b/i

describe('arena compliance (no gambling / pay-to-win)', () => {
  it('fair-play copy names earned Merits and rules out pay-to-win', () => {
    expect(en.Arena_Fair_Play).toMatch(/Merits/)
    expect(en.Arena_Fair_Play).toMatch(/pay-to-win/i)
  })

  const DEFAULT_IDS = [
    'def_weekly_step_league', 'def_daily_focus', 'def_season_ladder',
    'def_weekly_top_n', 'def_weekend_warrior', 'def_monthly_liveops'
  ]
  const TYPES = ['league_fixture', 'daily_focus', 'liveops', 'something_unknown']

  it('every default contest advertises Merits and no purchase/wager language', () => {
    for (const id of DEFAULT_IDS) {
      const c = catalogFor({ id })
      expect(c.prizes).toMatch(/Merits/)
      expect(c.prizes).not.toMatch(FORBIDDEN)
      expect(c.tagline).not.toMatch(FORBIDDEN)
      expect(c.howItWorks).not.toMatch(FORBIDDEN)
    }
  })

  it('type fallbacks and the safe default also carry no purchase/wager language', () => {
    for (const type of TYPES) {
      const c = catalogFor({ id: 'x_' + type, type })
      expect(c.prizes).not.toMatch(FORBIDDEN)
      expect(c.tagline).not.toMatch(FORBIDDEN)
    }
    const d = catalogFor(null)
    expect(d.prizes).not.toMatch(FORBIDDEN)
  })
})
