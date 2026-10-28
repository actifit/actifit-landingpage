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

export const AFIT_TIPS_AVAILABLE = false
export const AFIT_MOVE_TO_HE_AVAILABLE = false
export const BUY_AFIT_AVAILABLE = false
export const MOD_ACTIONS_AVAILABLE = false

/**
 * Cancel a pending AFIT -> H-E move. Returns { url, body } for wallet.vue's postAuthed
 * (which adds the session header) - the server cancels for the session user; `user` is
 * sent only so the server can reject a mismatch.
 */
export function cancelAfitMoveRequest (apiUrl, user) {
  return {
    url: apiUrl + 'cancelAFITMoveSE/',
    body: JSON.stringify(user ? { user } : {})
  }
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

/** The /downEbook link for a freshly issued access token. */
export function ebookDownloadHref (apiUrl, user, productId, accessToken) {
  return apiUrl + 'downEbook/' +
    '?user=' + encodeURIComponent(user) +
    '&product_id=' + encodeURIComponent(productId) +
    '&access_token=' + encodeURIComponent(accessToken)
}
