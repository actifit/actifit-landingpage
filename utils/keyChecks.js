/**
 * Classify a private key against an account's on-chain authorities.
 *
 * Used by in-browser transaction signing (the key prompt and the buy-now forms). Login
 * has its own check (mixins/signedChallengeLogin.js), backed by actifit-bot accepting
 * only a posting-key signature. Duplicated security logic is how LoginModal.vue and
 * pages/login.vue drifted apart before, so new signing paths should import this.
 *
 * Returns one of:
 *   'owner' | 'active' | 'posting'  - the key matches that authority
 *   'none'                          - a valid key that matches none of them
 *   'invalid'                       - not a parseable private key at all
 *   'unknown'                       - the account lookup failed, so we cannot tell
 *
 * 'unknown' means the lookup failed. keyRefusal() below REFUSES it: an unchecked key may
 * be an active or owner key, and a posting key is kept in the browser until logout.
 *
 * Owner is checked FIRST: a key that is somehow present in several authorities is
 * reported as the most powerful one, because that is the one that matters.
 */
import hive from '@hiveio/hive-js'

const LOOKUP_TIMEOUT_MS = 8000

const pubsOf = (auth) =>
  (auth && Array.isArray(auth.key_auths)) ? auth.key_auths.map((k) => k[0]) : []

export function publicKeyOf (wif) {
  try {
    return hive.auth.wifToPublic(wif)
  } catch (e) {
    return null
  }
}

// Read the account's authorities from the Hive node itself (the hive-js instance the
// store configures), NOT through actifit-bot: the key check must not depend on our own
// backend being honest, and the proxy route is rate-limited per IP.
export async function fetchAccount (username) {
  let timeoutId
  try {
    const accounts = await Promise.race([
      hive.api.getAccountsAsync([username]),
      new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => reject(new Error('timeout')), LOOKUP_TIMEOUT_MS)
      })
    ])
    const acct = Array.isArray(accounts) ? accounts[0] : null
    return (acct && acct.name === username && acct.owner && acct.active && acct.posting) ? acct : null
  } catch (e) {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function classifyKey (username, wif) {
  const pub = publicKeyOf(wif)
  if (!pub) return 'invalid'
  const acct = await fetchAccount(username)
  if (!acct) return 'unknown'
  if (pubsOf(acct.owner).indexOf(pub) !== -1) return 'owner'
  if (pubsOf(acct.active).indexOf(pub) !== -1) return 'active'
  if (pubsOf(acct.posting).indexOf(pub) !== -1) return 'posting'
  return 'none'
}

/**
 * Should a key of this kind be refused for an operation needing `requested` authority?
 * Returns the translation key of the reason, or null to accept.
 *
 * ONE rule, used by the key prompt AND by the buy-now forms that collect the active key
 * themselves - so neither can quietly accept what the other refuses.
 *
 * 'unknown' (the account lookup failed) is REFUSED here, unlike at login. A key accepted
 * here is used at once to sign, and a posting key is then kept in memory for the session:
 * accepting an unchecked key could keep an ACTIVE key in memory, or sign a payment with an
 * owner key. "Could not check your key - try again" costs one retry.
 */
export function keyRefusal (kind, requested) {
  if (kind === 'invalid') return 'key_prompt_invalid'
  if (kind === 'unknown') return 'key_prompt_check_failed'
  // Never accept a more powerful key than the operation needs: an owner key can take the
  // account, an active key can move funds. The chain would accept either, so only we can
  // catch the slip.
  if (kind === 'owner') return 'key_prompt_owner_refused'
  if (requested === 'posting' && kind === 'active') return 'posting_key_only_login'
  if (requested === 'active' && kind === 'posting') return 'key_prompt_not_active'
  if (kind === 'none') return requested === 'active' ? 'key_prompt_not_active' : 'key_prompt_not_posting'
  return null
}
