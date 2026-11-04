/**
 * Wallet / market actions that used to be authorised by the funds password.
 *
 * Every funds password is treated as known to the attacker since the 2026-10-21
 * incident, so actifit-bot retired them (HTTP 410 FUNDS_PASS_RETIRED). What still works
 * is authorised by the user's LOGIN SESSION (x-acti-token) instead, and the server takes
 * the user from that session:
 *  - cancelling a pending AFIT -> Hive-Engine move   POST /cancelAFITMoveSE
 *  - re-issuing an ebook download link               GET  /reissueDownloadToken
 *
 *  - sending AFIT to another user                   POST /tipAccount
 *  - starting / adjusting a daily move to H-E        POST /initiateAFITMoveSE
 *
 * Buying AFIT (/confirmBuyAction) and moderator actions (/modAction) are still disabled
 * server side, so the site shows a "temporarily unavailable" note instead of their forms.
 * Each flow has a flag below: false puts the note back in place of the form. If a route
 * answers 503 (disabled for security maintenance) anyway, the form shows the same note
 * as its error instead of failing silently.
 *
 * Kept out of the .vue pages so it can be unit-tested (jest cannot load wallet.vue).
 */
import { exchangeErrorText } from './afitExchange'

// re-enabled server side after the post-incident maintenance
export const AFIT_TIPS_AVAILABLE = true
export const AFIT_MOVE_TO_HE_AVAILABLE = true
export const BUY_AFIT_AVAILABLE = false
export const MOD_ACTIONS_AVAILABLE = false

/*
 * More flows that are disabled server side (HTTP 503) or whose backend job is paused since
 * the incident. Each one is hidden BEFORE the user signs or pays anything, and a translated
 * "*_unavailable" note says why. Flip a flag once the backend side is back.
 */
// Signup, paid AND promo-code (both go through /confirmPayment): no payment address/memo.
export const SIGNUP_AVAILABLE = false
// Claiming free signup links (/claimFreeSignupAccounts); the links are redeemed via signup.
export const FREE_SIGNUP_LINKS_AVAILABLE = false
// AFIT -> BSC bridge (/appendBridgeTransaction + the bridge job): no AFIT lock + HBD fee.
export const BSC_BRIDGE_AVAILABLE = false
// Market: ebook / service orders (/processBuyOrder) and real products (/purchaseRealProduct).
// Gadgets (type 'ingame') are not affected.
export const EBOOK_PURCHASE_AVAILABLE = false
export const REAL_PRODUCT_PURCHASE_AVAILABLE = false
// Weekly gadget-buyer prize draw (the draw job is paused): no countdown to a draw date.
export const GADGET_PRIZE_DRAW_AVAILABLE = false
// AFIT-funded arena challenges (the backend drops them: ARENA_FUNDING_PAUSED). Badge-only
// challenges are unchanged.
export const ARENA_AFIT_PRIZES_AVAILABLE = false

/**
 * Cancel a pending AFIT -> H-E move: { url, body }. The server cancels for the session
 * user; `user` is sent only so the server can reject a mismatch.
 */
export function cancelAfitMoveRequest (apiUrl, user) {
  return {
    url: apiUrl + 'cancelAFITMoveSE/',
    body: JSON.stringify(user ? { user } : {})
  }
}

/**
 * Send the cancel with the login session. Returns { status, outcome } (outcome is {} when
 * the reply is not JSON - e.g. express-rate-limit's plain-text 429) so the caller can
 * show the real reason via exchangeErrorText.
 */
export async function requestCancelAfitMove ({ apiUrl, user, sessionToken }) {
  const { url, body } = cancelAfitMoveRequest(apiUrl, user)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-acti-token': 'Bearer ' + sessionToken
    },
    body
  })
  const outcome = await res.json().catch(() => ({}))
  return { status: res.status, outcome }
}

/** URL of the session-authorised "download again" re-issue for one product. */
export function reissueDownloadTokenUrl (apiUrl, productId) {
  return apiUrl + 'reissueDownloadToken?product_id=' + encodeURIComponent(productId)
}

/**
 * Ask the server to re-enable the ebook download for the session user.
 * Returns { status, outcome } - outcome is {} when the reply is not JSON. On success the
 * server answers { success: 'success', access_token } (same as the retired
 * /validatePassForDownload).
 */
export async function requestReissueDownloadToken ({ apiUrl, productId, sessionToken }) {
  const res = await fetch(reissueDownloadTokenUrl(apiUrl, productId), {
    headers: {
      'Content-Type': 'application/json',
      'x-acti-token': 'Bearer ' + sessionToken
    }
  })
  const outcome = await res.json().catch(() => ({}))
  return { status: res.status, outcome }
}

/**
 * Re-download failure in words the user can act on: session / key-rotation gate / rate
 * limit as for the exchange; a missing purchase record gets its own message; any other
 * server reason (raw English like 'User mismatch', 'generic error') becomes the generic
 * error.
 */
export function reissueErrorText (status, outcome, t, gateMessage) {
  const o = outcome || {}
  const shown = exchangeErrorText(status, o, t, gateMessage)
  if (o.error && shown === o.error) {
    return o.error === 'Access token record not found' ? t('no_purchase_record_for_product') : t('error_performing_operation')
  }
  return shown
}

/** The /downEbook link for a freshly issued access token. */
export function ebookDownloadHref (apiUrl, user, productId, accessToken) {
  return apiUrl + 'downEbook/' +
    '?user=' + encodeURIComponent(user) +
    '&product_id=' + encodeURIComponent(productId) +
    '&access_token=' + encodeURIComponent(accessToken)
}

/*
 * Sending AFIT to another user (/tipAccount) and starting / adjusting a daily AFIT -> H-E
 * move (/initiateAFITMoveSE). Both are authorised by the login session; the server takes
 * the sender from it.
 */

/** "@Alice " -> "alice": what people type or paste for a Hive username. */
export function normalizeHiveUsername (raw) {
  return String(raw == null ? '' : raw).trim().replace(/^@/, '').toLowerCase()
}

// Hive account names: 3-16 chars, dot-separated segments of 3+ chars, each starting with a
// letter, ending with a letter or digit, with only letters, digits and dashes between.
const HIVE_SEGMENT = /^[a-z][a-z0-9-]+[a-z0-9]$/
export function isValidHiveUsername (name) {
  if (typeof name !== 'string' || name.length < 3 || name.length > 16) return false
  return name.split('.').every((seg) => seg.length >= 3 && HIVE_SEGMENT.test(seg))
}

/**
 * An AFIT amount typed by the user: the translation key of what is wrong with it, or null.
 * Must be a plain positive number with at most 3 decimals (AFIT's precision), within
 * `balance` (an unknown balance counts as not enough).
 */
export function afitAmountError (raw, balance) {
  const s = String(raw == null ? '' : raw).trim()
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(s) || !(parseFloat(s) > 0)) return 'amount_positive_int'
  if ((s.split('.')[1] || '').length > 3) return 'amount_max_3_decimals'
  const bal = parseFloat(balance)
  if (!isFinite(bal) || parseFloat(s) > bal + 1e-9) return 'amount_above_balance'
  return null
}

/**
 * Check the send-AFIT form. Returns { error } (a translation key) or the cleaned
 * { recipient, amount } to send (amount as a canonical decimal string).
 */
export function validateAfitTip ({ sender, recipient, amount, balance }) {
  if (!sender) return { error: 'Need_login_tip' }
  const to = normalizeHiveUsername(recipient)
  if (!isValidHiveUsername(to)) return { error: 'tip_invalid_recipient' }
  if (to === normalizeHiveUsername(sender)) return { error: 'Cannot_tip_self' }
  const amountErr = afitAmountError(amount, balance)
  if (amountErr) return { error: amountErr }
  // canonical form for the server's /^\d+(\.\d{1,3})?$/: ".5" -> "0.5", "5." -> "5"
  return { recipient: to, amount: String(Number(String(amount).trim())) }
}

async function postSession (url, payload, sessionToken) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-acti-token': 'Bearer ' + sessionToken
      },
      body: JSON.stringify(payload)
    })
    const outcome = await res.json().catch(() => ({}))
    return { status: res.status, outcome }
  } catch (e) {
    // network failure: no status, shown as the generic error
    return { status: 0, outcome: {} }
  }
}

/** Send AFIT to `targetUser`. Returns { status, outcome } (outcome {} when not JSON). */
export function requestAfitTip ({ apiUrl, targetUser, amount, sessionToken }) {
  return postSession(apiUrl + 'tipAccount/', { targetUser, amount }, sessionToken)
}

/** Start (or adjust) the daily AFIT -> H-E move. Returns { status, outcome }. */
export function requestAfitMoveToHe ({ apiUrl, amount, sessionToken }) {
  return postSession(apiUrl + 'initiateAFITMoveSE/', { amount }, sessionToken)
}

/**
 * Why a tip / move failed, as text (shown with {{ }}, never v-html). A 503 means the route
 * is switched off for security maintenance: say so with `unavailableKey`'s note. Otherwise
 * as for the exchange: key-rotation gate, expired session, rate limit, then the server's
 * own reason ({ error }), else the generic error.
 */
export function sessionActionErrorText (status, outcome, t, gateMessage, unavailableKey) {
  if (status === 503) return t(unavailableKey)
  return exchangeErrorText(status, outcome, t, gateMessage)
}
