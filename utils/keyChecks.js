/**
 * Classify a private key against an account's on-chain authorities.
 *
 * Shared by the login mixin and by in-browser transaction signing, deliberately. These
 * checks used to be at risk of being copied per call site, and duplicated security logic
 * is how LoginModal.vue and pages/login.vue drifted apart before (one of them read
 * json.HIVE where the API returns json.userdata, and Keychain login there broke for
 * everyone). One implementation, imported where needed.
 *
 * Returns one of:
 *   'owner' | 'active' | 'posting'  - the key matches that authority
 *   'none'                          - a valid key that matches none of them
 *   'invalid'                       - not a parseable private key at all
 *   'unknown'                       - the account lookup failed, so we cannot tell
 *
 * 'unknown' exists so callers can FAIL OPEN on a lookup problem. These checks guard the
 * user against their own slip, not us against an attacker - the chain itself rejects a
 * signature from a key without the right authority - so blocking an action because a
 * chain read failed would trade a real outage for no security.
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

export async function fetchAccount (username) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS)
  try {
    const res = await fetch('/api/proxy/getAccountData?user=' +
      encodeURIComponent(username) + '&bchain=HIVE', { signal: controller.signal })
    const json = await res.json()
    const acct = json && (json.HIVE || json)
    return (acct && acct.owner && acct.active && acct.posting) ? acct : null
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
