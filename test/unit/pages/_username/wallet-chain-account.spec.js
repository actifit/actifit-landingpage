// With Blurt selected, @actifit.pay's wallet showed "6,629,660.329 BP" ($9,394) instead of
// 4,135 BP: the first load read the account from Hive while the vests were converted with
// Blurt's rate (Hive vests x Blurt rate). Every account and chain-properties read must
// come from the selected chain.
// wallet.vue cannot be loaded by jest (see wallet-total.spec.js), so this checks the source.
import fs from 'fs'
import path from 'path'

const src = fs.readFileSync(path.join(__dirname, '../../../../pages/_username/wallet.vue'), 'utf8')
const method = (name) => {
  const start = src.indexOf('\n    async ' + name + '(') >= 0 ? src.indexOf('\n    async ' + name + '(') : src.indexOf('\n    ' + name + '(')
  expect(start).toBeGreaterThan(0)
  return src.slice(start, src.indexOf('\n    },', start))
}

describe('the wallet reads the account on the selected chain', () => {
  it('first load: from the selected chain, not always Hive', () => {
    const init = method('initWallet')
    expect(init).not.toContain('hive.api.getAccountsAsync([this.displayUser])')
    expect(init).toMatch(/const accountChain = this\.setProperNode\(\);[\s\S]{0,200}accountChain\.api\.getAccountsAsync\(\[this\.displayUser\]\)/)
    // the Blurt node is configured further down; this read comes first
    expect(init).toMatch(/if \(accountChain === blurt\) blurt\.api\.setOptions\(\{ url: process\.env\.blurtApiNode \}\);/)
  })

  it('the chain is synced before the first read, so conversions use the same chain', () => {
    const init = method('initWallet')
    expect(init.indexOf("this.cur_bchain = localStorage.getItem('cur_bchain')")).toBeGreaterThan(-1)
    expect(init.indexOf("this.cur_bchain = localStorage.getItem('cur_bchain')")).toBeLessThan(init.indexOf('accountChain.api.getAccountsAsync'))
  })

  it('after a claim the account is re-read on the selected chain, not copied from the store', () => {
    expect(src).not.toContain('this.fixUserData(this.user.account)')
    expect(src).toMatch(/const res = await this\.setProperNode\(\)\.api\.getAccountsAsync\(\[this\.user\.account\.name\]\);\s*if \(res && res\.length\) this\.fixUserData\(res\[0\]\);/)
  })

  it('refreshing one\'s own wallet does not reuse the store account (the Hive one)', () => {
    const refresh = method('refreshAllWalletData')
    expect(refresh).not.toContain('this.displayUserData = this.user.account')
    expect(refresh).toContain('this.setProperNode().api.getAccountsAsync([this.user.account.name])')
  })
})

describe('the vests rate belongs to the selected chain', () => {
  // evaluate the method on its own: it only reads this.properties and this.cur_bchain
  const body = method('propertiesMatchChain')
  // eslint-disable-next-line no-new-func
  const propertiesMatchChain = new Function(body.slice(body.indexOf('{') + 1))
  const hiveProps = { total_vesting_fund_hive: '1 HIVE', total_vesting_shares: '1 VESTS' }
  const blurtProps = { total_vesting_fund_blurt: '1 BLURT', total_vesting_shares: '1 VESTS' }

  it('properties loaded for another chain, or not at all, do not match', () => {
    expect(propertiesMatchChain.call({ cur_bchain: 'BLURT', properties: hiveProps })).toBe(false)
    expect(propertiesMatchChain.call({ cur_bchain: 'HIVE', properties: blurtProps })).toBe(false)
    expect(propertiesMatchChain.call({ cur_bchain: 'BLURT', properties: '' })).toBe(false)
  })

  it('properties of the selected chain match', () => {
    expect(propertiesMatchChain.call({ cur_bchain: 'BLURT', properties: blurtProps })).toBe(true)
    expect(propertiesMatchChain.call({ cur_bchain: 'HIVE', properties: hiveProps })).toBe(true)
  })

  it('both conversions reload properties that do not match, instead of only empty ones', () => {
    expect(src).not.toContain("if (this.properties == '') {")
    expect(method('vestsToSteemPower')).toContain('if (!this.propertiesMatchChain()) {')
    expect(method('steemPowerToVests')).toContain('if (!this.propertiesMatchChain()) {')
    expect(method('calculateSavingsRewardsParams')).toContain('if (!this.propertiesMatchChain()) {')
  })

  it('the HBD interest estimate runs only on Hive (Blurt has no HBD savings)', () => {
    expect(method('calculateSavingsRewardsParams')).toMatch(/^\s*async calculateSavingsRewardsParams\(\) \{\s*if \(this\.cur_bchain !== 'HIVE'\) return;/)
  })
})
