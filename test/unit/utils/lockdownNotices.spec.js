// Flows that are disabled server side (HTTP 503) or whose backend job is paused since the
// 2026-10-21 incident. Each must be hidden BEFORE the user signs or pays anything, with a
// translated note instead (flags in utils/sessionActions.js). Before this, users could send
// a signup payment, lock AFIT + an HBD fee for the BSC bridge, or sign a market order and
// only then hit the 503 - money gone, nothing delivered.
//
// Product.vue and arena/create.vue load in jest, so their guards are exercised for real;
// the pages jest cannot load (wallet.vue, signup.vue, ...) are checked at source level.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn(), transferAsync: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import fs from 'fs'
import path from 'path'
import {
  SIGNUP_AVAILABLE, FREE_SIGNUP_LINKS_AVAILABLE, BSC_BRIDGE_AVAILABLE, EBOOK_PURCHASE_AVAILABLE,
  REAL_PRODUCT_PURCHASE_AVAILABLE, GADGET_PRIZE_DRAW_AVAILABLE, ARENA_AFIT_PRIZES_AVAILABLE
} from '~/utils/sessionActions'
import Product from '~/components/Product.vue'

const ROOT = path.join(__dirname, '../../..')
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')
// the body of a method, from its signature to the next method at the same indent
const methodBody = (src, sig) => {
  const start = src.indexOf(sig)
  expect(start).toBeGreaterThan(0)
  const next = src.slice(start + sig.length).search(/\n {4}(async )?[A-Za-z_]+ ?\([^)]*\) ?\{/)
  return src.slice(start, next < 0 ? undefined : start + sig.length + next)
}

const NEW_KEYS = ['signup_unavailable', 'free_signup_links_unavailable', 'bsc_bridge_unavailable',
  'ebook_purchase_unavailable', 'real_product_purchase_unavailable', 'gadget_prize_draw_unavailable',
  'arena_afit_prizes_unavailable', 'rc_delegation_login_needed']

describe('availability flags', () => {
  it('are all off until the backend side is back', () => {
    expect([SIGNUP_AVAILABLE, FREE_SIGNUP_LINKS_AVAILABLE, BSC_BRIDGE_AVAILABLE, EBOOK_PURCHASE_AVAILABLE,
      REAL_PRODUCT_PURCHASE_AVAILABLE, GADGET_PRIZE_DRAW_AVAILABLE, ARENA_AFIT_PRIZES_AVAILABLE])
      .toEqual([false, false, false, false, false, false, false])
  })

  const LOCALES = fs.readdirSync(path.join(ROOT, 'lang')).filter((f) => f.endsWith('.js'))
  it('covers all 14 locales', () => expect(LOCALES).toHaveLength(14))
  it.each(LOCALES)('lang/%s has every new note, translated', (file) => {
    const mod = require(path.join(ROOT, 'lang', file))
    const m = mod.default || mod
    const enMod = require(path.join(ROOT, 'lang', 'en_US.js'))
    const en = enMod.default || enMod
    for (const k of NEW_KEYS) {
      expect(typeof m[k]).toBe('string')
      expect(m[k].length).toBeGreaterThan(10)
      if (file !== 'en_US.js') expect(m[k]).not.toBe(en[k])
    }
  })

  it.each([
    ['pages/signup.vue', ['signup_unavailable']],
    ['pages/referrals.vue', ['free_signup_links_unavailable']],
    ['pages/_username/wallet.vue', ['bsc_bridge_unavailable', 'rc_delegation_login_needed']],
    ['components/Product.vue', ['ebook_purchase_unavailable', 'real_product_purchase_unavailable']],
    ['pages/market.vue', ['gadget_prize_draw_unavailable']],
    ['pages/arena/create.vue', ['arena_afit_prizes_unavailable']]
  ])('%s renders its notes as text, not v-html', (file, keys) => {
    const src = read(file)
    for (const k of keys) {
      expect(src).toContain(`{{ $t('${k}') }}`)
      expect(src).not.toMatch(new RegExp(`v-html="\\$t\\('${k}'\\)"`))
    }
  })
})

describe('signup (paid and promo both go through /confirmPayment)', () => {
  const src = read('pages/signup.vue')
  it('the payment address / memo / amount and the confirm buttons only render while signup works', () => {
    const start = src.indexOf('<template v-if="signupAvailable">')
    expect(start).toBeGreaterThan(0)
    const end = src.indexOf('</template>', start)
    const block = src.slice(start, end)
    for (const el of ['id="actifit-address"', 'id="actifit-memo"', 'id="invested-amount"', 'id="promo-code-val"', 'v-on:click="checkFunds"', "$t('notice_send_amount')"]) {
      expect(block).toContain(el)
    }
    // ...and nowhere else on the page (no other path - ?promo=, ?referrer= - can show them)
    const tpl = src.slice(0, src.indexOf('<script>'))
    const outside = tpl.slice(0, start) + tpl.slice(end)
    for (const el of ['actifit-address', 'actifit-memo', 'checkFunds"', 'notice_send_amount']) expect(outside).not.toContain(el)
  })
  it('the "don\'t send any payment" note shows while signup is off', () => {
    expect(src.match(/<div v-if="!signupAvailable"[^>]*>\{\{ \$t\('signup_unavailable'\) \}\}<\/div>/g)).toHaveLength(2)
    expect(src).toMatch(/signupAvailable: SIGNUP_AVAILABLE/)
  })
  it('checkFunds never reaches /confirmPayment while off, and the memo setter survives the hidden field', () => {
    expect(methodBody(src, 'async checkFunds() {')).toMatch(/^async checkFunds\(\) \{\s*\/\/[^\n]*\n\s*if \(!this\.signupAvailable\) return;/)
    expect(methodBody(src, 'setMemoValue() {')).toMatch(/if \(memoEl\) memoEl\.value = memo/)
  })
})

describe('referrals: free signup links', () => {
  const src = read('pages/referrals.vue')
  it('the claim button is gated, the note shown, and the claim never sent while off', () => {
    expect(src).toContain('<div v-if="freeSignupLinksAvailable && hasClaimableLinks.status">')
    expect(src).toContain('<div v-if="!freeSignupLinksAvailable" class="alert alert-warning" role="alert">')
    expect(src).toMatch(/async claimSignupLinks\(\)\{\s*if \(!this\.freeSignupLinksAvailable\) return;/)
  })
})

describe('wallet: BSC bridge', () => {
  const src = read('pages/_username/wallet.vue')
  it('the move-to-BSC button and the BSC menu entry only exist while the bridge runs', () => {
    expect(src).toContain(`<span v-if="bscBridgeAvailable && token.symbol == 'AFIT'" class="btn btn-brand p-1" v-on:click="initiateBSCTransfer(token)">`)
    expect(src).toMatch(/\.\.\.\(this\.bscBridgeAvailable \? \[\{ id: 'bsc'/)
    expect(src.match(/initiateBSCTransfer\(/g)).toHaveLength(2) // the gated button + the method
    expect(src.match(/showBSCAddress\(\)/g)).toHaveLength(2) // the gated menu entry + the method
  })
  it('no AFIT lock + HBD fee is broadcast while the bridge is paused', () => {
    expect(src).toMatch(/async proceedTransferBSC\(\) \{\s*(\/\/[^\n]*\n\s*)+if \(!this\.bscBridgeAvailable\) return;/)
    expect(src).toMatch(/initiateBSCTransfer\(token\) \{\s*if \(!this\.bscBridgeAvailable\) return;/)
    expect(src).toMatch(/bscBridgeAvailable: BSC_BRIDGE_AVAILABLE/)
  })
})

describe('wallet: RC delegation is signed in the browser', () => {
  const src = read('pages/_username/wallet.vue')
  const body = methodBody(src, 'async proceedRCDelegation(cancellation) {')
  it('no longer calls the retired server-side /delegateRC', () => {
    expect(src).not.toMatch(/delegateRC\//)
  })
  it('every browser-signing session (Keychain, HiveAuth, typed key) broadcasts the same delegate_rc custom_json', () => {
    expect(body).toContain('this.processTrxFunc(op_name, cstm_params)')
    expect(body).toContain("JSON.stringify(['delegate_rc', {")
    expect(body).toMatch(/delegatees: \[this\.\$refs\["delegate-recipient"\]\.value\.trim\(\)\]/)
    expect(body).toMatch(/required_posting_auths: \[this\.user\.account\.name\]/)
    expect(body).toContain("const transId = 'rc';")
    // no Keychain/HiveAuth-only branch left that sends the rest elsewhere
    expect(body).not.toMatch(/acti_login_method/)
  })
  it('legacy HiveSigner sessions get a note instead of a request that cannot work', () => {
    expect(body).toMatch(/if \(!localStorage\.getItem\('std_login'\)\) \{\s*this\.error_proceeding = true;\s*this\.error_msg = this\.\$t\('rc_delegation_login_needed'\);\s*return;/)
    expect(src).toContain(`<div v-if="!isStdLogin" class="text-brand text-center p-2">{{ $t('rc_delegation_login_needed') }}</div>`)
  })
})

describe('market: gadget prize draw', () => {
  const src = read('pages/market.vue')
  it('the countdown is replaced by the paused note (no implied draw date)', () => {
    expect(src).toMatch(/<p class="prize-draw-card-text" v-if="!gadgetPrizeDrawAvailable">\{\{ \$t\('gadget_prize_draw_unavailable'\) \}\}<\/p>\s*<Countdown v-else-if=/)
    expect(src).toMatch(/gadgetPrizeDrawAvailable: GADGET_PRIZE_DRAW_AVAILABLE/)
  })
})

describe('market: Product.vue purchases', () => {
  const src = read('components/Product.vue')
  const ctx = (type, over) => Object.assign({
    user: { account: { name: 'alice', balance: '100.000 HIVE' } },
    product: { _id: 'p1', type, count: 5, name: 'X', level: 1 },
    ebookPurchaseAvailable: false,
    realProductPurchaseAvailable: false,
    allReqtsFilled: true,
    userTokens: 1000,
    item_price: 10,
    item_price_extra: 0,
    buyAttempt: false,
    buyInProgress: false,
    checkout_product: false,
    errorProceed: '',
    processTrxFunc: jest.fn(),
    numberFormat: (n) => String(n),
    $t: (k) => k
  }, over || {})

  beforeEach(() => { global.confirm = jest.fn(() => false); global.fetch = jest.fn() })
  afterEach(() => { delete global.confirm; delete global.fetch })

  it('defaults both flags off in the component', () => {
    const d = Product.data.call({ product: { type: 'ebook' } })
    expect(d.ebookPurchaseAvailable).toBe(false)
    expect(d.realProductPurchaseAvailable).toBe(false)
  })

  it.each(['ebook', 'service'])('buyNow on a %s returns before any prompt or signing', async (type) => {
    const c = ctx(type)
    await Product.methods.buyNow.call(c)
    expect(global.confirm).not.toHaveBeenCalled()
    expect(c.processTrxFunc).not.toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
    expect(c.buyAttempt).toBe(false)
  })

  it('buyNow on a gadget is NOT blocked (gadgets stay buyable)', async () => {
    const c = ctx('ingame')
    await Product.methods.buyNow.call(c)
    expect(global.confirm).toHaveBeenCalled() // reached the purchase prompt as before
    expect(c.buyAttempt).toBe(true)
  })

  it('real products: no checkout form and no payment while off', async () => {
    const c = ctx('real')
    await Product.methods.prepareCheckout.call(c)
    expect(c.checkout_product).toBe(false)
    expect(c.buyAttempt).toBe(false)
    await Product.methods.proceedBuyReal.call(c)
    expect(c.buyInProgress).toBe(false)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(global.confirm).not.toHaveBeenCalled()
  })

  it('the Buy buttons for ebooks/services and real products are gated, with the notes in their place', () => {
    expect(src).toContain('<div class="buy-actions-block" v-if="!checkout_product && realProdBuyStatus && realProductPurchaseAvailable">')
    expect(src).toContain(`<div v-else-if="!checkout_product && realProdBuyStatus" class="text-brand p-2">{{ $t('real_product_purchase_unavailable') }}</div>`)
    expect(src).toContain('<div v-else-if="!productBought && !this.errorProceed && ebookPurchaseAvailable">')
    expect(src).toContain(`<div v-else-if="!productBought && !ebookPurchaseAvailable" class="text-brand p-2">{{ $t('ebook_purchase_unavailable') }}</div>`)
  })

  it('the dead buy-AFIT-with-HIVE path (/buyAfitHive, disabled) is gone', () => {
    expect(Product.methods.buyAFITNow).toBeUndefined()
    expect(Product.methods.getMatchingHIVE).toBeUndefined()
    expect(src).not.toMatch(/buyAfitHive|buyAFITHive|buyAfitInProgress|userActvKeyHv/)
  })
})
