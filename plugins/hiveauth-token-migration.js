/**
 * One-time migration of the HiveAuth (HAS) token to its own storage key.
 *
 * The signed-challenge login split what `access_token` used to hold. It was overloaded:
 * the API session JWT for Keychain and typed-key logins, but the HAS token for HiveAuth
 * ones, disambiguated only by `acti_login_method`. HiveAuth now gets a real API session
 * too, so it needs both at once - the JWT stays in `access_token` (every x-acti-token
 * caller reads it), and the HAS token moved to `hiveauth_has_token`, which is what all 16
 * HAS broadcast sites now read.
 *
 * WHY THIS MUST EXIST: users who logged in via HiveAuth BEFORE that change still have
 * their HAS token under `access_token`, and nothing under `hiveauth_has_token`. HAS
 * `broadcast` asserts on `auth.token` inside a promise executor whose throw never settles
 * the outer promise - so with a null token their votes, posts, comments and transfers
 * would not fail, they would HANG FOREVER, with no wallet prompt and no error. That is
 * worse than an error: it looks like the site is broken and gives them nothing to act on.
 *
 * Moving the token restores their broadcasts with no re-login. Clearing the old slot is
 * correct, not just tidy: an old HiveAuth session never held an API JWT, so its
 * `access_token` was a HAS token being sent to our API as a bearer credential. Their API
 * calls already failed for that reason and keep failing until they log in again - which
 * now gives them a real session. So this is no regression for them, only a repair.
 *
 * Idempotent and harmless for everyone else: it acts only when the login method is
 * hiveauth AND the new key is empty, so a session created after the change is untouched.
 */
export default function () {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem('acti_login_method') !== 'hiveauth') return
    if (localStorage.getItem('hiveauth_has_token')) return
    const legacy = localStorage.getItem('access_token')
    if (!legacy) return
    localStorage.setItem('hiveauth_has_token', legacy)
    localStorage.removeItem('access_token')
  } catch (e) {
    // Private mode / blocked storage: there is nothing stored to migrate.
  }
}
