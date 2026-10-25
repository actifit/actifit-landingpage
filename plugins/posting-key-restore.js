// Client only. Put the typed-key user's stored posting key back in the store on page
// load, so a reload or a new tab signs without asking again (see utils/postingKeyStore.js).
import { loadPostingKey } from '~/utils/postingKeyStore'

export default ({ store }) => {
  const wif = loadPostingKey()
  if (wif && !store.state.chatPostingKey) store.commit('setChatPostingKey', wif)
}
