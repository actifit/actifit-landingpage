// Stops Hive Keychain and HiveAuth from signing a Blurt-meant action on Hive.
// See utils/hiveSignerGuard.js for what is refused and why.
import Vue from 'vue'
import { guardKeychain, guardHiveAuth } from '~/utils/hiveSignerGuard'

const CHAIN_NAMES = { BLURT: 'Blurt', STEEM: 'Steem' }

export default ({ app }) => {
  const refuse = (chain) => {
    const message = app.i18n.t('signer_hive_only').replace('_CHAIN_', CHAIN_NAMES[chain] || chain)
    if (Vue.notify) Vue.notify({ group: 'error', text: message, position: 'top center', duration: 10000 })
    return message
  }

  guardHiveAuth(Vue.prototype.$HAS, localStorage, refuse)

  // The extension adds window.hive_keychain itself, usually before the site's scripts run
  // but not always, so try again a little later too.
  const tryKeychain = () => guardKeychain(window.hive_keychain, localStorage, refuse)
  if (!tryKeychain()) {
    window.addEventListener('load', tryKeychain)
    setTimeout(tryKeychain, 1500)
    setTimeout(tryKeychain, 5000)
  }
}
