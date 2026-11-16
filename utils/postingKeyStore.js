/**
 * The typed-key user's POSTING key, kept in the browser (localStorage) so it survives
 * reloads and is shared by every tab - the way ecency and hive.blog keep it.
 *
 * Why stored at all: keeping it in memory only meant asking for the key again after
 * every reload and in every new tab. The server never receives it (signing happens in
 * the browser), so this replaces nothing the incident abused.
 *
 * What it is NOT for: active or owner keys. Those are asked for per action and never
 * stored (utils/keyPrompt.js, plugins/vue-custom.js $broadcastWithKey).
 *
 * Stored with the username, and restored only for a typed-key session of that same
 * user, so a key can never be restored into another account's session.
 */
import { publicKeyOf } from '~/utils/keyChecks'

// One entry per chain. A user whose Blurt key differs from their Hive key enters it once,
// and it is kept under the same rules as the Hive one.
const STORAGE_KEYS = { HIVE: 'acti_posting_key', BLURT: 'acti_blurt_posting_key' }
const storageKey = (chain) => STORAGE_KEYS[chain] || STORAGE_KEYS.HIVE

// A typed-key login is active (not Keychain / HiveAuth / HiveSigner / logged out).
// The ONE rule for both saving and restoring.
export function typedKeySessionActive () {
  try {
    return !!localStorage.getItem('std_login') && !localStorage.getItem('acti_login_method')
  } catch (e) {
    return false
  }
}

// Is `wif` one of this account's posting keys? Checked against the account object the
// site already holds (chain data), so a key can never be saved under the wrong account
// - e.g. by a stale tab that still holds the previous user's key.
export function isPostingKeyOf (account, wif) {
  const pub = publicKeyOf(wif)
  const auths = account && account.posting && account.posting.key_auths
  return !!pub && Array.isArray(auths) && auths.some((k) => k[0] === pub)
}

export function savePostingKey (user, wif, chain) {
  if (!user || !wif) return
  try {
    localStorage.setItem(storageKey(chain), JSON.stringify({ user, wif }))
  } catch (e) { /* storage blocked (private mode): memory-only for this session */ }
}

export function clearPostingKey (chain) {
  try { localStorage.removeItem(storageKey(chain)) } catch (e) { /* nothing stored */ }
}

// The stored key, if it belongs to the current typed-key session; else null. A key
// stored for any other situation (another user, a Keychain/HiveAuth login, logged out)
// is removed rather than left behind.
export function loadPostingKey (chain) {
  try {
    const raw = localStorage.getItem(storageKey(chain))
    if (!raw) return null
    const stored = JSON.parse(raw)
    if (typedKeySessionActive() && stored && stored.wif &&
        stored.user === localStorage.getItem('std_login_name')) {
      return stored.wif
    }
  } catch (e) { /* unreadable: treat as absent */ }
  clearPostingKey(chain)
  return null
}
