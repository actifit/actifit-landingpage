// Guest QA findings: market draw winner, login error left under the HiveAuth QR,
// the dialog jumping, and the proposal title.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import fs from 'fs'
import path from 'path'
import MarketPage from '~/pages/market.vue'
import LoginModal from '~/components/LoginModal.vue'
import LoginPage from '~/pages/login.vue'

const root = path.join(__dirname, '../../..')
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8')

describe('market: Last Draw Winner', () => {
  const vm = () => ({ lastDrawWinner: '', lastDrawWinnerFailed: false, wonAmount: 0, nextGadgetBuyRewardDate: '', numberFormat: (n) => String(n) })

  it('shows the winner when there is one', () => {
    const ctx = vm()
    MarketPage.methods.setNextPrizeDate.call(ctx, { nextDrawDate: '2026-11-10', winner: [{ name: 'alice', reward: 12.5 }] })
    expect(ctx.lastDrawWinner).toBe('alice')
    expect(ctx.wonAmount).toBe('12.5')
    expect(ctx.lastDrawWinnerFailed).toBe(false)
  })
  it('an empty winner list no longer throws: it shows a dash', () => {
    const ctx = vm()
    expect(() => MarketPage.methods.setNextPrizeDate.call(ctx, { nextDrawDate: '2026-11-10', winner: [] })).not.toThrow()
    expect(ctx.lastDrawWinnerFailed).toBe(true)
    MarketPage.methods.setNextPrizeDate.call(ctx, { nextDrawDate: '2026-11-10' })
    expect(ctx.lastDrawWinner).toBe('')
  })
  it('a failed fetch shows a dash instead of staying blank', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'))
    const ctx = vm()
    ctx.setNextPrizeDate = MarketPage.methods.setNextPrizeDate.bind(ctx)
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await MarketPage.methods.fetchGadgetPrizeCycle.call(ctx)
    spy.mockRestore()
    delete global.fetch
    expect(ctx.lastDrawWinnerFailed).toBe(true)
  })
  it('the template never renders a bare "@" or "0 HIVE" while loading', () => {
    const src = read('pages/market.vue')
    expect(src).toMatch(/<template v-if="lastDrawWinner">\s*<a :href="'\/' \+ lastDrawWinner"/)
    expect(src).toMatch(/v-else-if="lastDrawWinnerFailed">—</)
  })
})

describe.each([['LoginModal', LoginModal], ['pages/login', LoginPage]])('%s: HiveAuth after a failed Keychain login', (_n, C) => {
  const methods = C.options ? C.options.methods : C.methods

  it('clears the old error before showing the QR', async () => {
    const vm = {
      login_in_progress: false, error_proceeding: true, error_msg: 'keychain_not_detected',
      $t: (k) => k, $refs: { username: { value: '' } }
    }
    await methods.loginHiveauth.call(vm)
    // empty username: the only error left is the new one, not Keychain's
    expect(vm.error_msg).toBe('login_error')
    vm.$refs.username.value = 'alice'
    vm.requestLoginChallenge = jest.fn().mockResolvedValue(null)
    await methods.loginHiveauth.call(vm)
    expect(vm.error_proceeding).toBe(false)
    expect(vm.error_msg).toBe('')
  })
  it('does nothing while another login is running', async () => {
    const vm = { login_in_progress: true, error_proceeding: true, error_msg: 'x', $refs: { username: { value: 'alice' } }, requestLoginChallenge: jest.fn() }
    await methods.loginHiveauth.call(vm)
    expect(vm.requestLoginChallenge).not.toHaveBeenCalled()
    expect(vm.error_msg).toBe('x')
  })
  it('Keychain login clears an earlier error too', async () => {
    const vm = {
      login_in_progress: false, error_proceeding: true, error_msg: 'auth_rejected_by_user',
      $t: (k) => k, $refs: { username: { value: '' } },
      verifyKeychain: jest.fn().mockResolvedValue(true), failLogin: jest.fn()
    }
    await methods.loginKeychain.call(vm)
    expect(vm.error_msg).toBe('login_error')
  })
})

describe('login dialog does not jump', () => {
  const src = read('components/LoginModal.vue')
  it('sizes the QR canvas up front and reserves the error line', () => {
    expect(src).toContain('<canvas id="hiveauth-qr" ref="hiveauth-qr" width="200" height="200" />')
    expect(src).toMatch(/class="text-brand text-center login-error-line"/)
    expect(src).not.toContain('modal-dialog-centered')
  })
})

describe('proposal popup title', () => {
  it('names the proposal by both numbers in every language', () => {
    const dir = path.join(root, 'lang')
    for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js'))) {
      const mod = require(path.join(dir, f))
      const t = (mod.default || mod).proposal_modal_title_year
      expect(`${f}: ${t}`).toMatch(/3 \(#391\)/)
    }
  })
})
