/**
 * Why an AFIT gadget / product buy failed, in words the user can act on.
 *
 * actifit-bot's buy routes (/buyGadget*, /buyMultiGadget*, /processBuyOrder) answer
 * {error: <text>} with a specific reason, and the multi-buy answers
 * {error, delivered: [ids]} when only some items were delivered - the AFIT of the
 * items that were NOT delivered is given back. The buy flows used to show one generic
 * error for all of these and only log the reason.
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
  // multi-buy: the first items were delivered (and charged), the rest refunded
  if (Array.isArray(o.delivered) && o.delivered.length > 0) return t('gadget_buy_partial_delivery')
  const err = typeof o.error === 'string' ? o.error : ''
  if (INSUFFICIENT.test(err)) return t('gadget_buy_insufficient_afit')
  if (BUSY.test(err)) return t('gadget_buy_busy')
  if (UNAVAILABLE.test(err)) return t('gadget_buy_unavailable')
  return t('error_performing_operation')
}
