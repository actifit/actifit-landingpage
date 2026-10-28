// Gadget / product buy failures: actifit-bot's specific reasons map to our own
// translated text; unknown text falls back to the generic error (utils/gadgetErrors.js).
import { gadgetBuyErrorText, AFIT_BUSY_ERROR } from '~/utils/gadgetErrors'

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

  it('reports a partial multi-buy delivery (the undelivered items were refunded)', () => {
    expect(text({ error: 'Error performing buy action. DB storing issue', delivered: ['a', 'b'] }))
      .toBe('[gadget_buy_partial_delivery]')
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
