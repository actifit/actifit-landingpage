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
 * Tips (/tipAccount), starting a move to Hive-Engine (/initiateAFITMoveSE), buying AFIT
 * (/confirmBuyAction) and moderator actions (/modAction) are disabled server side, so the
 * site shows a "temporarily unavailable" note instead of their forms. The request code is
 * kept (session-authorised, no password) so re-enabling them is a backend change plus
 * flipping the flag below.
 *
 * Kept out of the .vue pages so it can be unit-tested (jest cannot load wallet.vue).
 */
import { exchangeErrorText } from './afitExchange'

export const AFIT_TIPS_AVAILABLE = false
export const AFIT_MOVE_TO_HE_AVAILABLE = false
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
