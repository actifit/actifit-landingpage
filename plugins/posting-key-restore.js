// Client only. Put the typed-key user's stored posting key back in the store on page
// load, so a reload or a new tab signs without asking again (see utils/postingKeyStore.js).
import { loadPostingKey } from '~/utils/postingKeyStore'

// Keys whose change in ANOTHER tab means this tab's posting key may be wrong.
const WATCHED = ['acti_posting_key', 'std_login', 'std_login_name', 'acti_login_method']

export default ({ store }) => {
  const wif = loadPostingKey()
  if (wif && !store.state.chatPostingKey) store.commit('setChatPostingKey', wif)

  // Logout (or a login as someone else) in another tab: this tab must not keep signing
  // with the old key from memory. Re-read the one stored for the current session.
  window.addEventListener('storage', (e) => {
    if (e.key !== null && WATCHED.indexOf(e.key) === -1) return
    const current = loadPostingKey()
    if (store.state.chatPostingKey !== current) store.commit('setChatPostingKey', current)
  })
}
