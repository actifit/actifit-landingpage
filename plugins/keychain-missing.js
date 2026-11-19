// One clear "Keychain was not detected" notice for a Keychain session whose extension is not
// on the page, instead of each flow's generic error. See utils/keychainMissing.js.
import Vue from 'vue'
import escapeHtml from '~/utils/escapeHtml'
import { createKeychainMissingNotice, keychainExpectedButMissing } from '~/utils/keychainMissing'

const SHOWN = 'acti_keychain_missing_shown'
const markShown = () => { try { sessionStorage.setItem(SHOWN, '1') } catch (e) { /* storage blocked */ } }
const wasShown = () => { try { return !!sessionStorage.getItem(SHOWN) } catch (e) { return false } }

export default ({ app }) => {
  const notify = Vue.notify
  if (typeof notify !== 'function') return
  // toasts render HTML
  const notice = createKeychainMissingNotice({ notify, message: () => escapeHtml(app.i18n.t('keychain_not_detected')) })

  // vue-notification puts the same function on both
  const filtered = (fn) => {
    const wrapped = function (params) {
      if (notice.allows(params)) return fn.apply(this, arguments)
    }
    wrapped.close = fn.close
    return wrapped
  }
  Vue.notify = filtered(Vue.notify)
  Vue.prototype.$notify = filtered(Vue.prototype.$notify || notify)

  // True (and the notice shown) when this is a Keychain session with no Keychain on the page:
  // the caller stops. $broadcastWithKey calls it for every typed-key fallback, and actions
  // that would otherwise ask for a typed active key call it first.
  Vue.prototype.$keychainMissing = function () {
    if (!keychainExpectedButMissing(localStorage, window)) return false
    notice.report()
    // The layout renders the notice's container a tick after the page mounts: a notice raised
    // before that is lost, so it must not use up the once-per-tab load notice.
    if (document.querySelector('.vue-notification-group')) markShown()
    return true
  }

  // Flows that never reach a broadcast are covered by telling the user once per tab, after
  // Keychain has had time to load: it injects itself once the page is idle.
  const checkOnLoad = () => setTimeout(() => {
    if (!keychainExpectedButMissing(localStorage, window) || wasShown()) return
    markShown()
    notice.report({ mute: false })
  }, 5000)
  if (document.readyState === 'complete') checkOnLoad()
  else window.addEventListener('load', checkOnLoad, { once: true })
}
