// A Keychain session whose extension is not on the page (crashed, disabled, not allowed on
// this site, a browser without it). Every Keychain branch on the site requires
// window.hive_keychain, so the action falls through to the typed-key path, which refuses
// Keychain sessions. Each flow then added its own generic toast ("error voting", "error
// performing operation"...) on top of, or instead of, the one that said what was wrong.
//
// One notice for all of them, in its own toast group (rendered once, in the layout, so it
// shows on every page and never stacks): after a refused action, the generic error toasts
// that action adds right after it are dropped.

export const NOTICE_GROUP = 'keychain-missing'
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

// notify: the toast function. message(): the (HTML-safe) text to show.
export function createKeychainMissingNotice ({ notify, message, now = Date.now }) {
  let mutedUntil = 0
  return {
    // mute: false for the page-load notice, which follows no failed action
    report ({ mute = true } = {}) {
      // replace a notice still showing (or dismissed): one at a time, and always visible feedback
      notify({ group: NOTICE_GROUP, clean: true })
      notify({ group: NOTICE_GROUP, text: message(), duration: 10000 })
      if (mute) mutedUntil = now() + MUTE_MS
    },
    // false: drop this toast (a generic error that follows a refused action)
    allows (params) {
      if (now() >= mutedUntil) return true
      return !(params && typeof params === 'object' && params.group === 'error' && !params.clean)
    },
  }
}
