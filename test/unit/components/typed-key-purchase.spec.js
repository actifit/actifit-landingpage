// Typed-key HIVE purchases, driven through the REAL Product.vue and CartModal.vue methods.
//
// The bug these pin: a typed-key user's buy-now broadcast a real HIVE transfer, then
// confirmed it on buyGadgetHive / buyMultiGadgetHive - routes that can only verify a
// transaction the SERVER signed (it no longer signs anything). actifit-bot answered
// {status:'error'}, the client only checked `outcome.error`, and the user was told the
// purchase had succeeded. Money sent, nothing delivered, success shown.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import Vue from 'vue'
import '@/plugins/vue-custom'
import Product from '~/components/Product.vue'
import CartModal from '~/components/CartModal.vue'

const TX = { id: 'tx123', ref_block_num: 7 }
const P = Vue.prototype

const pluginHelpers = () => ({
  $confirmFailed: P.$confirmFailed,
  $signsInBrowser: P.$signsInBrowser,
  $signingErrorText: P.$signingErrorText,
  $notifyPaymentNotConfirmed: P.$notifyPaymentNotConfirmed
})

const t = (k) => (k === 'payment_sent_not_confirmed' ? 'SENT-NOT-CONFIRMED _TX_' : k)

const respond = (...bodies) => {
  global.fetch = jest.fn()
  bodies.forEach((b) => global.fetch.mockResolvedValueOnce({ json: async () => b }))
}
const fetchedUrl = (i = 0) => new URL(String(global.fetch.mock.calls[i][0]))

beforeEach(() => {
  process.env.actiAppUrl = 'https://api.test/'
  process.env.actiAppBackUrl = 'https://api2.test/'
  process.env.actifitMarketBuy = 'actifit.market'
  localStorage.clear()
  localStorage.setItem('std_login', 'true')
  localStorage.setItem('acti_login_method', '') // typed key
})
afterEach(() => { delete global.fetch; localStorage.clear() })

function productCtx (overrides) {
  const ctx = Object.assign({
    user: { account: { name: 'alice', balance: '100.000 HIVE' } },
    product: { _id: 'p1', type: 'ingame', count: 5, name: 'Shoe', level: 1 },
    allReqtsFilled: true,
    item_price: 10,
    afitPrice: { afitHiveLastPrice: 0.1 },
    userActvKey: 'typed-active-wif',
    paymentInFlight: false,
    buyAttempt: false,
    buyInProgress: false,
    errorProceed: '',
    isKeychainActive: false,
    isHiveauthActive: false,
    setProperNode: jest.fn(),
    checkProductBought: jest.fn(),
    $broadcastWithKey: jest.fn().mockResolvedValue({ success: true, trx: { tx: TX } }),
    $t: t,
    $notify: jest.fn(),
    $emit: jest.fn(),
    $store: { dispatch: jest.fn(), commit: jest.fn() }
  }, pluginHelpers(), overrides || {})
  ctx.confirmCompletion = Product.methods.confirmCompletion
  ctx.errorCompletion = Product.methods.errorCompletion
  return ctx
}

function cartCtx (overrides) {
  const ctx = Object.assign({
    user: { account: { name: 'alice' } },
    cartEntries: [{ _id: 'a' }, { _id: 'b' }],
    product_price_afit: 10,
    afitPrice: { afitHiveLastPrice: 0.1 },
    userActvKey: 'typed-active-wif',
    paymentInFlight: false,
    buyAttempt: false,
    buyInProgress: false,
    errorProceed: '',
    isKeychainActive: false,
    isHiveauthActive: false,
    $broadcastWithKey: jest.fn().mockResolvedValue({ success: true, trx: { tx: TX } }),
    $t: t,
    $notify: jest.fn(),
    $emit: jest.fn(),
    $store: { dispatch: jest.fn(), commit: jest.fn() }
  }, pluginHelpers(), overrides || {})
  ctx.confirmCompletion = CartModal.methods.confirmCompletion
  ctx.errorCompletion = CartModal.methods.errorCompletion
  return ctx
}

const flows = [
  {
    name: 'Product.vue buy-now',
    ctx: productCtx,
    run: (ctx) => Product.methods.proceedBuyNowHive.call(ctx),
    route: '/buyGadgetHiveKeychain/alice/p1/tx123/HIVE',
    expectedOp: [['transfer', { from: 'alice', to: 'actifit.market', amount: '1.000 HIVE', memo: 'buy-gadget:p1' }]],
    succeeded: (ctx) => ctx.checkProductBought.mock.calls.length > 0 &&
      String(ctx.errorProceed).includes('purchase_success_ingame_part1')
  },
  {
    name: 'CartModal.vue buy-now',
    ctx: cartCtx,
    run: (ctx) => CartModal.methods.proceedBuyNowHive.call(ctx),
    route: '/buyMultiGadgetHiveKeychain/alice/a-b/tx123/HIVE',
    expectedOp: [['transfer', { from: 'alice', to: 'actifit.market', amount: '1.000 HIVE', memo: 'buy-gadget:a-b' }]],
    succeeded: (ctx) => ctx.$store.commit.mock.calls.some(([n, v]) => n === 'setPurchaseSuccess' && v === true)
  }
]

describe.each(flows)('$name with a typed key', (flow) => {
  it('confirms on the ON-CHAIN verified route, with the exact operation', async () => {
    respond({ status: 'Success' })
    await flow.run(flow.ctx())

    const url = fetchedUrl()
    expect(url.pathname).toBe(flow.route)
    expect(JSON.parse(url.searchParams.get('operation'))).toEqual(flow.expectedOp)
  })

  it('reports success only when actifit-bot confirms it', async () => {
    respond({ status: 'Success' })
    const ctx = flow.ctx()
    await flow.run(ctx)
    expect(flow.succeeded(ctx)).toBe(true)
  })

  it('NEVER shows success on {status:"error"} - says the payment was sent, with the tx id', async () => {
    // both the first attempt and the retry fail verification
    respond({ status: 'error' }, { status: 'error' })
    const ctx = flow.ctx()
    await flow.run(ctx)

    expect(flow.succeeded(ctx)).toBe(false)
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(ctx.errorProceed).toBe('SENT-NOT-CONFIRMED tx123')
    // a toast that stays: the panel holding errorProceed is hidden when the flow ends
    expect(ctx.$notify).toHaveBeenCalledWith(expect.objectContaining({
      group: 'error', text: 'SENT-NOT-CONFIRMED tx123', duration: -1
    }))
  })

  it('a second click while a payment is in flight broadcasts nothing', async () => {
    const ctx = flow.ctx({ paymentInFlight: true })
    await flow.run(ctx)
    expect(ctx.$broadcastWithKey).not.toHaveBeenCalled()
    // and the in-flight payment still holds the lock (Product.vue used to release it
    // here, from `finally`, letting a THIRD click send a second transfer)
    expect(ctx.paymentInFlight).toBe(true)
    expect(ctx.userActvKey).toBe('typed-active-wif')
  })

  it('a blocked click during payment 1 cannot unlock payment 2', async () => {
    let finishFirst
    respond({ status: 'Success' })
    const ctx = flow.ctx({
      $broadcastWithKey: jest.fn(() => new Promise((r) => { finishFirst = r }))
    })
    const first = flow.run(ctx)          // payment 1: waiting on the signature
    await flow.run(ctx)                  // click 2: blocked
    ctx.userActvKey = 'typed-active-wif' // the user re-types the key (old code cleared it)
    flow.run(ctx)                        // click 3: must be blocked too
    await new Promise((r) => setTimeout(r, 0))
    expect(ctx.$broadcastWithKey).toHaveBeenCalledTimes(1)
    finishFirst({ success: true, trx: { tx: TX } })
    await first
    expect(ctx.paymentInFlight).toBe(false)
  })

  it('a failed validation keeps the typed key (nothing was attempted)', async () => {
    const ctx = flow.ctx({ user: null })
    await flow.run(ctx)
    expect(ctx.userActvKey).toBe('typed-active-wif')
    expect(ctx.$broadcastWithKey).not.toHaveBeenCalled()
  })

  it('releases the lock and drops the typed active key when done', async () => {
    respond({ status: 'Success' })
    const ctx = flow.ctx()
    await flow.run(ctx)
    expect(ctx.paymentInFlight).toBe(false)
    expect(ctx.userActvKey).toBe('')
  })

  it('a failed broadcast shows its (already escaped) message and confirms nothing', async () => {
    global.fetch = jest.fn()
    const ctx = flow.ctx({
      $broadcastWithKey: jest.fn().mockResolvedValue({ error: true, trx: { tx: { error: '&lt;b&gt;nope' } } })
    })
    await flow.run(ctx)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(ctx.errorProceed).toBe('&lt;b&gt;nope')
    expect(ctx.paymentInFlight).toBe(false)
  })
})
