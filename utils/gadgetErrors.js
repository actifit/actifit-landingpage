/**
 * Why an AFIT gadget / product buy failed, in words the user can act on.
 *
 * actifit-bot's buy routes (/buyGadget*, /buyMultiGadget*, /processBuyOrder) answer
 * {error: <text>} with a specific reason, and the multi-buy answers
 * {error, delivered: [ids]} when only the first items were delivered. The server tries to
 * give back the AFIT of the rest, but that can fail; only `refunded: true` (once the
 * server sends it) lets us tell the user they were not charged for them. The buy flows
 * used to show one generic error for all of these and only log the reason.
 *
 * Known server texts map to our own translation keys; anything else falls back to the
 * generic error. The server's text is never returned as-is: the one exception, the
 * key-rotation gate message (its instruction is the point), comes back HTML-escaped,
 * because errorProceed is rendered with v-html. The result is safe for v-html.
 *
 * Kept out of the components so it can be unit-tested (jest cannot load them well).
 */

import escapeHtml from './escapeHtml'

// actifit-bot app.js AFIT_BUSY_ERROR (the per-account AFIT lock is held)
export const AFIT_BUSY_ERROR = 'Another AFIT transaction for this account is being processed. Please try again in a moment.'

const INSUFFICIENT = /not have enough AFIT funds/i
const BUSY = /AFIT transaction for this account is being processed/i
// gadgetDeliveryError() / gadgetAfitPrice() in buyGadgets(): refused before any AFIT is taken
const UNAVAILABLE = /^(Product not found|Product is not an in-game gadget|Product cannot be bought|Product price is not valid)/i

/**
 * @param outcome     the route's JSON reply
 * @param t           translate function (key -> text)
 * @param gateMessage optional (outcome) -> key-rotation gate text or null ($gateMessage)
 */
export function gadgetBuyErrorText (outcome, t, gateMessage) {
  const o = outcome || {}
  const gate = typeof gateMessage === 'function' ? gateMessage(o) : null
  if (gate) return escapeHtml(gate)
  if (Array.isArray(o.delivered) && o.delivered.length > 0) {
    return t(o.refunded === true ? 'gadget_buy_partial_delivery' : 'gadget_buy_partial_check_balance')
  }
  const err = typeof o.error === 'string' ? o.error : ''
  if (INSUFFICIENT.test(err)) return t('gadget_buy_insufficient_afit')
  if (BUSY.test(err)) return t('gadget_buy_busy')
  if (UNAVAILABLE.test(err)) return t('gadget_buy_unavailable')
  return t('error_performing_operation')
}

/**
 * The cart after a partial multi-buy: the delivered items are paid for, so they leave the
 * cart (a retry must not buy them again). `delivered` is the first N items in cart order;
 * each delivered id removes ONE matching entry - the store's removeCartEntry would drop
 * every duplicate of an id, including ones that were not delivered.
 */
export function cartAfterPartialDelivery (entries, delivered) {
  const rest = Array.isArray(entries) ? entries.slice() : []
  for (const id of (Array.isArray(delivered) ? delivered : [])) {
    const i = rest.findIndex((e) => e && String(e._id) === String(id))
    if (i !== -1) rest.splice(i, 1)
  }
  return rest
}
