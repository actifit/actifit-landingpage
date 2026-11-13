// The typed-key posting key is kept in the browser (like ecency / hive.blog) so a
// reload or a new tab does not ask for it again. These pin WHO it is kept for, and
// that every way a session ends removes it.
jest.mock('@hiveio/hive-js', () => ({
  auth: { wifToPublic: jest.fn((wif) => { if (!/^5K/.test(wif)) throw new Error('bad'); return 'PUB_' + wif }) },
  config: { set: jest.fn() }, // store/actions.js configures the node on load
  api: { setOptions: jest.fn() }
}))

import Vue from 'vue'
import Vuex from 'vuex'
import { savePostingKey, loadPostingKey, clearPostingKey } from '~/utils/postingKeyStore'
import createStore from '~/store'
import restorePlugin from '~/plugins/posting-key-restore'

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
// a chain account whose posting authority holds `wif`
const account = (name, wif) => ({ account: { name, posting: { key_auths: [['PUB_' + wif, 1]] } } })
const stored = () => JSON.parse(localStorage.getItem('acti_posting_key') || 'null')

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
  beforeEach(() => {
    localStorage.clear()
    process.client = true
    store = createStore()
  })
  afterEach(() => { delete process.client })

  it('saves at login: key committed first, account second (LoginModal order)', () => {
    typedSession('alice')
    store.commit('setChatPostingKey', '5Kalice')
    expect(stored()).toBeNull() // account not known yet
    store.commit('steemconnect/login', account('alice', '5Kalice'))
    expect(stored()).toEqual({ user: 'alice', wif: '5Kalice' })
  })

  it('saves a key entered at the prompt for a logged-in user', () => {
    typedSession('alice')
    store.commit('steemconnect/login', account('alice', '5Knew'))
    store.commit('setChatPostingKey', '5Knew')
    expect(stored()).toEqual({ user: 'alice', wif: '5Knew' })
  })

  it('never saves a key that is not one of the account\'s posting keys', () => {
    typedSession('alice')
    store.commit('steemconnect/login', account('alice', '5Kalice'))
    store.commit('setChatPostingKey', '5Ksomeoneelse')
    expect(stored()).toBeNull()
  })

  it('a stale tab holding A\'s key does not save it as B\'s, and switches to B\'s stored key', () => {
    typedSession('alice')
    store.commit('steemconnect/login', account('alice', '5Kalice'))
    store.commit('setChatPostingKey', '5Kalice')
    // meanwhile, in another tab, alice logged out and bob logged in with his key
    typedSession('bob')
    savePostingKey('bob', '5Kbob')
    store.commit('steemconnect/login', account('bob', '5Kbob')) // this tab refreshes the user
    expect(stored()).toEqual({ user: 'bob', wif: '5Kbob' })
    expect(store.state.chatPostingKey).toBe('5Kbob')
  })

  it('clears it on logout and when the key is dropped (e.g. rotated)', () => {
    typedSession('alice')
    store.commit('steemconnect/login', account('alice', '5Kalice'))
    store.commit('setChatPostingKey', '5Kalice')
    store.commit('setChatPostingKey', null)
    expect(stored()).toBeNull()
    store.commit('setChatPostingKey', '5Kalice')
    store.commit('steemconnect/logout')
    expect(stored()).toBeNull()
  })

  it('"switch user" to Keychain or HiveAuth drops the typed key from memory and storage', () => {
    typedSession('alice')
    store.commit('steemconnect/login', account('alice', '5Kalice'))
    store.commit('setChatPostingKey', '5Kalice')
    localStorage.setItem('acti_login_method', 'keychain')
    store.commit('steemconnect/login', account('alice', '5Kalice'))
    expect(store.state.chatPostingKey).toBeNull()
    expect(stored()).toBeNull()
  })

  it.each([
    ['HiveSigner (no std_login)', () => localStorage.setItem('std_login_name', 'alice')],
    ['Keychain', () => { typedSession('alice'); localStorage.setItem('acti_login_method', 'keychain') }]
  ])('never saves for a %s session', (_, setup) => {
    setup()
    store.commit('setChatPostingKey', '5Kalice')
    store.commit('steemconnect/login', account('alice', '5Kalice'))
    expect(stored()).toBeNull()
  })
})

describe('posting-key-restore plugin', () => {
  let store
  beforeEach(() => {
    localStorage.clear()
    process.client = true
    store = createStore()
  })
  afterEach(() => { delete process.client })

  it('restores the stored key on page load', () => {
    typedSession('alice')
    savePostingKey('alice', '5Kalice')
    restorePlugin({ store })
    expect(store.state.chatPostingKey).toBe('5Kalice')
  })

  it('a logout in ANOTHER tab drops the key from this tab\'s memory', () => {
    typedSession('alice')
    savePostingKey('alice', '5Kalice')
    restorePlugin({ store })
    // the other tab logs out: its storage writes reach this tab as `storage` events
    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: 'std_login' }))
    expect(store.state.chatPostingKey).toBeNull()
  })
})

// The page-load login action of the patched vue-steemconnect (patches/). When the
// server REJECTS the session it must clear it - before, the leftovers stayed and the
// stored posting key was restored on every load with no logout left to clear it.
describe('vue-steemconnect login action on a rejected session', () => {
  const loginAction = () => {
    const VueSC = require('vue-steemconnect').default || require('vue-steemconnect')
    const FakeVue = { prototype: {} }
    VueSC.install(FakeVue, { app: 'test', callbackURL: 'http://localhost/auth' })
    return FakeVue.SteemConnectStore.actions.login
  }
  const run = async (status, body) => {
    process.env.actiAppUrl = 'https://api.test/'
    typedSession('alice')
    localStorage.setItem('access_token', 'jwt')
    global.fetch = jest.fn().mockResolvedValue({ status, json: async () => body })
    const commit = jest.fn()
    await loginAction()({ commit, state: { user: null } }).catch(() => {})
    delete global.fetch
    return commit
  }
  beforeEach(() => localStorage.clear())

  it('an invalid/expired token clears the session and logs out', async () => {
    const commit = await run(200, { success: false, message: 'Token is not valid' })
    expect(localStorage.getItem('std_login')).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(commit).toHaveBeenCalledWith('logout')
  })

  it('a server/node error (5xx) keeps the session', async () => {
    const commit = await run(503, { success: false, message: 'Account data temporarily unavailable' })
    expect(localStorage.getItem('std_login')).toBe('true')
    expect(commit).not.toHaveBeenCalledWith('logout')
  })
})
