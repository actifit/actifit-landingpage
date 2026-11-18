// A Keychain session whose extension is not on the page (crashed, disabled, not allowed on
// this site, a browser without it). Every Keychain branch on the site requires
// window.hive_keychain, so the action falls through to the typed-key path, which refuses
// Keychain sessions. Each flow then added its own generic toast ("error voting", "error
// performing operation"...) on top of, or instead of, the one that said what was wrong.
//
// One notice for all of them: the Keychain message is shown once, and the generic error
// toasts the failed action adds right after it are dropped.

// long enough for the failing action's own error toast to follow; short enough not to hide
// the next, unrelated error
export const MUTE_MS = 4000

// std_login: acti_login_method is not cleared on logout, so a later HiveSigner session still has it
export function keychainExpectedButMissing (storage, win) {
  try {
    return !!storage.getItem('std_login') && storage.getItem('acti_login_method') === 'keychain' && !win.hive_keychain
  } catch (e) {
    return false
  }
}

// notify: the unfiltered toast function. message(): the (HTML-safe) text to show.
export function createKeychainMissingNotice ({ notify, message, now = Date.now }) {
  let mutedUntil = 0
  return {
    report () {
      const t = now()
      if (t >= mutedUntil) notify({ group: 'error', text: message(), position: 'top center', duration: 10000 })
      mutedUntil = t + MUTE_MS
    },
    // false: drop this toast (a generic error that follows the Keychain notice)
    allows (params) {
      if (now() >= mutedUntil) return true
      if (typeof params === 'string') return false
      return !(params && params.group === 'error' && !params.clean)
    },
  }
}
