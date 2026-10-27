/**
 * AFIT -> vote reward boost exchange (actifit-bot POST /performAfitSteemExchange).
 *
 * Authorised by the user's LOGIN SESSION (x-acti-token), not the funds password: every
 * funds password is treated as known to the attacker since 2026-10-21, so the server
 * checks the session belongs to this account and its keys are not flagged instead.
 *
 * Kept out of pages/_username/wallet.vue so it can be unit-tested (jest cannot load that
 * page).
 */

/** Send the exchange. Returns { status, outcome } - outcome is {} when the reply is not JSON. */
export async function requestAfitExchange ({ apiUrl, user, tokens, sessionToken }) {
  const res = await fetch(apiUrl + 'performAfitSteemExchange', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-acti-token': 'Bearer ' + sessionToken
    },
    body: JSON.stringify({ user, tokens })
  })
  const outcome = await res.json().catch(() => ({}))
  return { status: res.status, outcome }
}

/**
 * The server's reason, in words the user can act on (shown as text, not HTML):
 *  - key rotation required / try again: the server's own message (gateMessage)
 *  - an expired or invalid session - checkHdrs answers 200 {success:false, message}, the
 *    key gate 401 LOGIN_AGAIN: log in again
 *  - anything else the route says (not enough AFIT, pending, invalid amount, ...)
 */
// checkHdrs answers HTTP 200 with these when the session is gone - e.g. a validly signed
// token whose session row was revoked (logged out elsewhere, or ended by the key-rotation
// gate). After the 2026-10-21 revocations this is the most common "expired" reply.
const SESSION_GONE = /^(Authentication failed|Invalid token payload|Auth token is not provided)/i

export function exchangeErrorText (status, outcome, t, gateMessage) {
  const o = outcome || {}
  const gate = gateMessage(o)
  if (gate) return gate
  // the key-rotation gate's own "log in again with your new key" says more than ours
  if (o.code === 'LOGIN_AGAIN' && typeof o.message === 'string' && o.message.trim()) return o.message
  if (status === 401 || o.code === 'LOGIN_AGAIN' ||
      (o.success === false && !o.error) ||
      (typeof o.error === 'string' && SESSION_GONE.test(o.error))) {
    return t('session_expired_login_again')
  }
  if (status === 429) return t('too_many_attempts')
  return o.error || t('error_performing_operation')
}
