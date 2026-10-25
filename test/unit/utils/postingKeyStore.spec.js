// The typed-key posting key is kept in the browser (like ecency / hive.blog) so a
// reload or a new tab does not ask for it again. These pin WHO it is restored for.
import Vue from 'vue'
import Vuex from 'vuex'
import { savePostingKey, loadPostingKey, clearPostingKey } from '~/utils/postingKeyStore'
import createStore from '~/store'

Vue.use(Vuex)
// stand-in for the vue-steemconnect module the Nuxt plugin registers
Vue.SteemConnectStore = {
  namespaced: true,
  state: () => ({ user: null }),
  mutations: { login (s, u) { s.user = u }, logout (s) { s.user = null } }
}

const typedSession = (user) => {
  localStorage.setItem('std_login', 'true')
  localStorage.setItem('acti_login_method', '')
  localStorage.setItem('std_login_name', user)
}

describe('postingKeyStore', () => {
  beforeEach(() => localStorage.clear())

  it('restores the key for the same user\'s typed-key session', () => {
    typedSession('alice')
    savePostingKey('alice', '5Kposting')
    expect(loadPostingKey()).toBe('5Kposting')
  })

  it.each([
    ['another user', () => typedSession('bob')],
    ['a Keychain session', () => { typedSession('alice'); localStorage.setItem('acti_login_method', 'keychain') }],
    ['a HiveAuth session', () => { typedSession('alice'); localStorage.setItem('acti_login_method', 'hiveauth') }],
    ['no session (logged out)', () => {}]
  ])('is NOT restored for %s, and is removed', (_, setup) => {
    savePostingKey('alice', '5Kposting')
    setup()
    expect(loadPostingKey()).toBeNull()
    expect(localStorage.getItem('acti_posting_key')).toBeNull()
  })

  it('treats unreadable data as absent', () => {
    typedSession('alice')
    localStorage.setItem('acti_posting_key', '{not json')
    expect(loadPostingKey()).toBeNull()
  })

  it('clearPostingKey removes it', () => {
    savePostingKey('alice', '5K')
    clearPostingKey()
    expect(localStorage.getItem('acti_posting_key')).toBeNull()
  })
})

describe('store keeps the browser copy in step', () => {
  let store
  const stored = () => JSON.parse(localStorage.getItem('acti_posting_key') || 'null')
  beforeEach(() => {
    localStorage.clear()
    process.client = true
    store = createStore()
  })
  afterEach(() => { delete process.client })

  it('saves at login: key committed first, account second (LoginModal order)', () => {
    localStorage.setItem('acti_login_method', '')
    store.commit('setChatPostingKey', '5Kposting')
    expect(stored()).toBeNull() // account not known yet
    store.commit('steemconnect/login', { account: { name: 'alice' } })
    expect(stored()).toEqual({ user: 'alice', wif: '5Kposting' })
  })

  it('saves a key entered at the prompt for a logged-in user', () => {
    localStorage.setItem('acti_login_method', '')
    store.commit('steemconnect/login', { account: { name: 'alice' } })
    store.commit('setChatPostingKey', '5Knew')
    expect(stored()).toEqual({ user: 'alice', wif: '5Knew' })
  })

  it('clears it on logout and when the key is dropped (e.g. rotated)', () => {
    localStorage.setItem('acti_login_method', '')
    store.commit('steemconnect/login', { account: { name: 'alice' } })
    store.commit('setChatPostingKey', '5K')
    store.commit('setChatPostingKey', null)
    expect(stored()).toBeNull()
    store.commit('setChatPostingKey', '5K')
    store.commit('steemconnect/logout')
    expect(stored()).toBeNull()
  })

  it('never saves for a Keychain or HiveAuth login', () => {
    localStorage.setItem('acti_login_method', 'keychain')
    store.commit('setChatPostingKey', '5K')
    store.commit('steemconnect/login', { account: { name: 'alice' } })
    expect(stored()).toBeNull()
  })
})
