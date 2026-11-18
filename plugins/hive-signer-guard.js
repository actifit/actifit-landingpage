// Stops Hive Keychain and HiveAuth from signing a Blurt-meant action on Hive.
// See utils/hiveSignerGuard.js for what is refused and why.
import Vue from 'vue'
import { guardKeychain, guardHiveAuth } from '~/utils/hiveSignerGuard'
import escapeHtml from '~/utils/escapeHtml'

const CHAIN_NAMES = { BLURT: 'Blurt', STEEM: 'Steem' }

export default ({ app }) => {
  const refuse = (chain) => {
    // the toast renders HTML; the chain comes from localStorage
    const message = app.i18n.t('signer_hive_only').replace('_CHAIN_', () => CHAIN_NAMES[chain] || escapeHtml(chain))
    if (Vue.notify) Vue.notify({ group: 'error', text: message, position: 'top center', duration: 10000 })
    return message
  }

  guardHiveAuth(Vue.prototype.$HAS, localStorage, refuse)

  // The extension adds window.hive_keychain itself, often after the site's scripts run (it
  // injects `var hive_keychain = {...}` once the page is idle), and a provider can replace it.
  // Do NOT put a getter/setter on window.hive_keychain to catch that: in Chrome, Keychain's
  // `var` assignment never reached the setter, window.hive_keychain stayed undefined, and
  // every Keychain action on the site fell back to "error voting" with no popup (1.14.55-57).
  // Instead wrap whatever is there at load, a little later, and right before every user action
  // (capture phase, ahead of the site's handlers). Wrapping is idempotent and cheap.
  const retry = () => { guardKeychain(window.hive_keychain, localStorage, refuse) }
  retry()
  window.addEventListener('load', retry)
  setTimeout(retry, 1500)
  setTimeout(retry, 5000)
  for (const type of ['pointerdown', 'mousedown', 'touchstart', 'keydown']) {
    document.addEventListener(type, retry, { capture: true, passive: true })
  }
}
