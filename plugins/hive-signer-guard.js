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

  const guard = (keychain) => guardKeychain(keychain, localStorage, refuse)
  guard(window.hive_keychain)
  // The extension adds window.hive_keychain itself, usually before the site's scripts run but
  // not always (a slow extension, Keychain installed mid-session, a mobile in-app browser), and
  // a provider can replace it. Wrap whatever is assigned, whenever it is assigned.
  try {
    let current = window.hive_keychain
    Object.defineProperty(window, 'hive_keychain', {
      configurable: true,
      enumerable: true,
      get: () => current,
      set: (value) => { current = value; guard(value) },
    })
  } catch (e) {
    console.warn('Keychain guard: cannot watch window.hive_keychain', e)
  }
  // in case it was defined in a way the trap cannot see
  const retry = () => guard(window.hive_keychain)
  window.addEventListener('load', retry)
  setTimeout(retry, 1500)
  setTimeout(retry, 5000)
}
