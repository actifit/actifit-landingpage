// One clear "Keychain was not detected" notice for a Keychain session whose extension is not
// on the page, instead of each flow's generic error. See utils/keychainMissing.js.
import Vue from 'vue'
import escapeHtml from '~/utils/escapeHtml'
import { createKeychainMissingNotice, keychainExpectedButMissing } from '~/utils/keychainMissing'

const SHOWN_ON_LOAD = 'acti_keychain_missing_shown'

export default ({ app }) => {
  const notify = Vue.notify
  if (typeof notify !== 'function') return
  // toasts render HTML
  const notice = createKeychainMissingNotice({ notify, message: () => escapeHtml(app.i18n.t('keychain_not_detected')) })

  // vue-notification puts the same function on both
  const filtered = (fn) => function (params) {
    if (notice.allows(params)) return fn.apply(this, arguments)
  }
  Vue.notify = filtered(Vue.notify)
  Vue.prototype.$notify = filtered(Vue.prototype.$notify || notify)

  // True (and the notice shown) when this is a Keychain session with no Keychain on the page:
  // the caller stops. $broadcastWithKey calls it for every typed-key fallback.
  Vue.prototype.$keychainMissing = function () {
    if (!keychainExpectedButMissing(localStorage, window)) return false
    notice.report()
    return true
  }

  // Flows that never reach a broadcast (they check for Keychain and give up, or show their own
  // form) are covered by telling the user once per tab, after Keychain has had time to load:
  // it injects itself once the page is idle.
  const checkOnLoad = () => setTimeout(() => {
    if (!keychainExpectedButMissing(localStorage, window)) return
    try {
      if (sessionStorage.getItem(SHOWN_ON_LOAD)) return
      sessionStorage.setItem(SHOWN_ON_LOAD, '1')
    } catch (e) { /* storage blocked: show it anyway */ }
    notice.report()
  }, 5000)
  if (document.readyState === 'complete') checkOnLoad()
  else window.addEventListener('load', checkOnLoad, { once: true })
}
