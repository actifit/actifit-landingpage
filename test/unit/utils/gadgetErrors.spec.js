// Gadget / product buy failures: actifit-bot's specific reasons map to our own
// translated text; unknown text falls back to the generic error (utils/gadgetErrors.js).
import { gadgetBuyErrorText, AFIT_BUSY_ERROR, cartAfterPartialDelivery } from '~/utils/gadgetErrors'

const t = (k) => '[' + k + ']'
const gate = (o) => (o && ['KEY_ROTATION_REQUIRED', 'KEY_ROTATION_HOLD', 'TRY_AGAIN'].includes(o.code) ? o.message : null)
const text = (outcome) => gadgetBuyErrorText(outcome, t, gate)

describe('gadgetBuyErrorText', () => {
  it('maps not-enough-AFIT replies (buy, multi-buy, wallet-minimum variant)', () => {
    expect(text({ error: 'Account does not have enough AFIT funds' })).toBe('[gadget_buy_insufficient_afit]')
    expect(text({ error: 'Account does not have enough AFIT funds in wallet. Minimum required is 10' })).toBe('[gadget_buy_insufficient_afit]')
  })

  it('maps the shared AFIT-lock busy reply', () => {
    expect(text({ error: AFIT_BUSY_ERROR })).toBe('[gadget_buy_busy]')
  })

  it('maps products that cannot be bought (refused before any AFIT is taken)', () => {
    for (const e of ['Product not found', 'Product is not an in-game gadget',
      'Product cannot be bought: it has no valid benefits', 'Product price is not valid']) {
      expect(text({ error: e })).toBe('[gadget_buy_unavailable]')
    }
  })

  it('a partial multi-buy says "not charged" only when the server confirms the refund', () => {
    expect(text({ error: 'Error performing buy action. DB storing issue', delivered: ['a', 'b'], refunded: true }))
      .toBe('[gadget_buy_partial_delivery]')
    // today's server sends no `refunded`; a failed give-back is silent, so tell the user to check
    expect(text({ error: 'Error performing buy action. DB storing issue', delivered: ['a', 'b'] }))
      .toBe('[gadget_buy_partial_check_balance]')
    expect(text({ error: 'x', delivered: ['a'], refunded: false })).toBe('[gadget_buy_partial_check_balance]')
  })

  it('a delivery failure with nothing delivered is the generic error', () => {
    expect(text({ error: 'Error performing buy action. DB storing issue', delivered: [] }))
      .toBe('[error_performing_operation]')
  })

  it('shows the key-rotation gate message, HTML-escaped (errorProceed is v-html)', () => {
    expect(text({ code: 'KEY_ROTATION_REQUIRED', message: 'Rotate <b>now</b>' })).toBe('Rotate &lt;b&gt;now&lt;/b&gt;')
    expect(text({ code: 'KEY_ROTATION_HOLD', message: 'Briefly unavailable' })).toBe('Briefly unavailable')
  })

  it('never echoes unknown server text; falls back to the generic error', () => {
    expect(text({ error: '<img src=x onerror=alert(1)>' })).toBe('[error_performing_operation]')
    expect(text({ error: 'error verifying trx' })).toBe('[error_performing_operation]')
    expect(text({ status: 'error' })).toBe('[error_performing_operation]')
    expect(text({ error: true })).toBe('[error_performing_operation]')
    expect(text(null)).toBe('[error_performing_operation]')
    expect(text(undefined)).toBe('[error_performing_operation]')
  })

  it('works without a gate function', () => {
    expect(gadgetBuyErrorText({ code: 'KEY_ROTATION_REQUIRED', message: 'x' }, t)).toBe('[error_performing_operation]')
  })
})

describe('cartAfterPartialDelivery', () => {
  const e = (id, n) => ({ _id: id, n })
  it('drops the delivered items (the first N, in cart order) and keeps the rest', () => {
    expect(cartAfterPartialDelivery([e('a'), e('b'), e('c')], ['a', 'b'])).toEqual([e('c')])
  })
  it('removes ONE entry per delivered id, so undelivered duplicates stay in the cart', () => {
    const cart = [e('a', 1), e('a', 2), e('b', 3)]
    expect(cartAfterPartialDelivery(cart, ['a'])).toEqual([e('a', 2), e('b', 3)])
    expect(cart).toHaveLength(3) // not mutated
  })
  it('matches ids as strings and ignores ids not in the cart', () => {
    expect(cartAfterPartialDelivery([e(5), e('x')], ['5', 'zz'])).toEqual([e('x')])
  })
  it('tolerates missing inputs', () => {
    expect(cartAfterPartialDelivery(undefined, ['a'])).toEqual([])
    expect(cartAfterPartialDelivery([e('a')], undefined)).toEqual([e('a')])
  })
})
