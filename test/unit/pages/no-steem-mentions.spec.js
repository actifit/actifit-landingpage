// Actifit does not support Steem officially, so pages people read must not name it
// (privacy policy, terms, code of conduct, yield farming, the "buy AFIT" options).
import fs from 'fs'
import path from 'path'
import YieldFarming from '~/pages/yieldfarming.vue'

const template = (file) => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../..', file), 'utf8')
  return src.slice(src.indexOf('<template>'), src.lastIndexOf('</template>'))
}

describe('no Steem in what people read', () => {
  it.each([
    'components/BuyOptionsModal.vue',
    'pages/privacy-policy.vue',
    'pages/terms-conditions.vue',
    'pages/conduct.vue',
    'pages/yieldfarming.vue',
  ])('%s', (file) => {
    expect(template(file)).not.toMatch(/steem/i)
  })
})

describe('yield farming APY', () => {
  const apy = (vm) => YieldFarming.methods.calculateYearlyAPY.call({
    numberFormat: YieldFarming.methods.numberFormat || ((n) => String(n)),
    ...vm,
  })

  // It used to wait for a Steem sample delegation as well, which never comes any more,
  // so the Hive APY always showed "- %".
  it('is computed from the Hive sample delegation alone', () => {
    const out = apy({
      randomAfitTrxHive: { delegated_amount: 1000, token_count: 10 },
      hivePrice: 0.2,
      afitPrice: { afitHiveLastUsdPrice: 0.01 },
    })
    // 10 AFIT x $0.01 a day on $200 delegated = 0.05% a day, 18.25% a year
    expect(out).toMatch(/^18\.25 ?%$/)
  })

  it('shows "- %" when the sample no longer delegates (instead of "NaN %")', () => {
    const base = { hivePrice: 0.2, afitPrice: { afitHiveLastUsdPrice: 0.01 } }
    expect(apy({ ...base, randomAfitTrxHive: { delegated_amount: NaN, token_count: 10 } })).toBe('- %')
    expect(apy({ ...base, randomAfitTrxHive: { delegated_amount: 0, token_count: 10 } })).toBe('- %')
  })

  it('the AFIT move toast names Hive-Engine, not Steem-Engine', () => {
    for (const f of fs.readdirSync(path.resolve(__dirname, '../../../lang')).filter((n) => n.endsWith('.js'))) {
      const line = fs.readFileSync(path.resolve(__dirname, '../../../lang', f), 'utf8').split('\n').find((l) => l.includes('power_down_successfully_initiated:'))
      expect([f, /S-E|एस-ई/.test(line)]).toEqual([f, false])
    }
  })

  it('shows "- %" until a Hive sample delegation is known', () => {
    expect(apy({ randomAfitTrxHive: '', hivePrice: 0.2, afitPrice: {} })).toBe('- %')
  })
})
