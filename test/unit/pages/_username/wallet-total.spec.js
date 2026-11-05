// Wallet "Account Estimated Value". Guest QA saw @actifit at $19,307 on one load and
// $608,722 on another, for an account worth about $8,889:
//  - the total was computed on the placeholder prices (HIVE $0.10) and never redone
//    when the real prices arrived;
//  - BSC AFIT/AFITX were valued at the BSC pool prices, 150-360x the Hive-Engine market;
//  - Hive-Engine tokens with no market price counted as 1 HIVE each, and the metrics
//    call (capped at 1,000 of 1,270+ rows) left some held tokens unpriced.
// wallet.vue itself cannot be loaded by jest (it has a JSX-like line), so the pricing
// rules live in utils/walletTotal.js and the wiring is checked on the source.
import fs from 'fs'
import path from 'path'
import { heTokenPriceHive, bscValuesUSD, neededPrices, metricsSymbols } from '~/utils/walletTotal'

const src = fs.readFileSync(path.join(__dirname, '../../../../pages/_username/wallet.vue'), 'utf8')

describe('Hive-Engine token prices', () => {
  const metrics = [{ symbol: 'PAL', lastPrice: '0.5' }, { symbol: 'DEAD', lastPrice: '0' }]
  it('uses the market price', () => {
    expect(heTokenPriceHive('PAL', metrics)).toBe(0.5)
  })
  it('does not count a token with no market price', () => {
    expect(heTokenPriceHive('NOPRICE', metrics)).toBe(0)
    expect(heTokenPriceHive('DEAD', metrics)).toBe(0)
    expect(heTokenPriceHive('PAL', null)).toBe(0)
  })
  it('counts SWAP.HIVE as 1 HIVE', () => {
    expect(heTokenPriceHive('SWAP.HIVE', metrics)).toBe(1)
  })
})

describe('BSC holdings', () => {
  it('are valued at the Actifit AFIT price and the Hive-Engine AFITX price', () => {
    // live 2026-11-05: AFIT $0.000000467, AFITX 0.2 HIVE, HIVE $0.046
    const v = bscValuesUSD({ afitBSC: '1000000', afitxBSC: '100', afitPriceUSD: 4.67e-7, afitxPriceHive: 0.2, hivePriceUSD: 0.046 })
    expect(v.afit).toBeCloseTo(0.467, 6)
    expect(v.afitx).toBeCloseTo(0.92, 6)
  })
  it('an unknown balance counts as 0, not NaN', () => {
    expect(bscValuesUSD({ afitBSC: undefined, afitxBSC: '', afitPriceUSD: 1, afitxPriceHive: 1, hivePriceUSD: 1 })).toEqual({ afit: 0, afitx: 0 })
  })
  it('the wallet no longer uses the BSC pool prices for the total', () => {
    expect(src).not.toMatch(/afitBalanceBSC\) \* this\.afitBSCPrice;/)
    expect(src).toMatch(/AFIT BSC x /)
    expect(src).toMatch(/AFITX BSC x /)
  })
})

describe('which prices the total waits for', () => {
  it('HIVE, AFIT, and HBD only when the account holds HBD', () => {
    expect(neededPrices('HIVE', { hbd_balance: '10.000 HBD' }, 0)).toEqual(['afit', 'hive', 'hbd'])
    expect(neededPrices('HIVE', { hbd_balance: '0.000 HBD' }, 0)).toEqual(['afit', 'hive'])
    expect(neededPrices('HIVE', { hbd_balance: '0.000 HBD' }, '1.000 HBD')).toEqual(['afit', 'hive', 'hbd'])
    expect(neededPrices('HIVE', null, 0)).toEqual(['afit', 'hive'])
  })
  it('the legacy chains need their own base price', () => {
    expect(neededPrices('STEEM', { sbd_balance: '1.000 SBD' }, 0)).toEqual(['afit', 'hive', 'steem', 'sbd'])
    expect(neededPrices('BLURT', {}, 0)).toEqual(['afit', 'hive', 'blurt'])
  })
})

describe('token metrics are fetched by symbol', () => {
  it('asks for the tokens of interest plus every held token, once each', () => {
    expect(metricsSymbols(['AFIT', 'AFITX'], [{ symbol: 'DEC' }, { symbol: 'AFIT' }, null, {}])).toEqual(['AFIT', 'AFITX', 'DEC'])
  })
  it('the wallet queries with $in and no longer reads the capped, unfiltered table', () => {
    expect(src).toContain("hsc.find('market', 'metrics', { symbol: { $in: symbols } }")
    expect(src).not.toContain("hsc.find('market', 'metrics', {}, 1000")
  })
})

describe('wallet.vue wiring', () => {
  it('recomputes the total when any price arrives', () => {
    for (const k of ['hivePrice', 'afitPrice', 'hbdPrice', 'tokenMetricsStatus']) {
      expect(src).toMatch(new RegExp(`\\n    ${k}: 'formattedTotAccountVal',`))
    }
    expect(src).toMatch(/priceStatus: \{ handler: 'formattedTotAccountVal', deep: true \}/)
  })
  it('computes nothing until every needed price is live and the token prices loaded', () => {
    expect(src).toMatch(/const pricesLive = this\.neededPrices\.every\(k => this\.priceStatus\[k\] === 'ok'\);\s*if \(this\.displayUserData && pricesLive && this\.tokenMetricsStatus === 'ok'\) \{/)
  })
  it('shows a spinner while loading and a dash when prices failed, never a placeholder total', () => {
    expect(src).toMatch(/v-if="!loading && !walletDataRefreshing && totalValueStatus === 'ready'"><small>\$<\/small>\{\{ totalAccountValue \}\}/)
    expect(src).toMatch(/totalValueStatus === 'failed'" :title="\$t\('account_value_unavailable'\)">—</)
  })
  it('every price fetch reports failure, so the total cannot wait forever', () => {
    for (const k of ['afit', 'hive', 'hbd', 'steem', 'sbd', 'blurt']) {
      expect(src).toMatch(new RegExp(`, '${k}'\\);`))
      expect(src).toMatch(new RegExp(`this\\.markPrice\\('${k}', !isNaN\\(p\\)\\);`))
    }
  })
})
