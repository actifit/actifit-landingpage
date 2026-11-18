// A Keychain session whose extension is not on the page (it crashed in the user's browser):
// every Keychain action fell through to the typed-key path, which refuses Keychain sessions,
// and each flow showed its own generic error ("error voting") with no popup. Now one notice
// says what is wrong, for every flow, and the generic toasts that follow it are dropped.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@blurtfoundation/blurtjs', () => ({ broadcast: { send: jest.fn() }, api: { setOptions: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import '@/plugins/vue-custom'
import plugin from '@/plugins/keychain-missing'
import hive from '@hiveio/hive-js'
import { requestKey } from '@/utils/keyPrompt'
import { MUTE_MS, createKeychainMissingNotice, keychainExpectedButMissing } from '@/utils/keychainMissing'

const MSG = 'Hive Keychain was not detected.'
const keychainSession = () => {
  localStorage.setItem('std_login', 'true')
  localStorage.setItem('acti_login_method', 'keychain')
  delete window.hive_keychain
}

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  delete window.hive_keychain
  jest.useRealTimers()
})

describe('keychainExpectedButMissing', () => {
  it('only a site login with Keychain as the method, and no Keychain on the page', () => {
    const store = (o) => ({ getItem: (k) => (k in o ? o[k] : null) })
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: 'keychain' }), {})).toBe(true)
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: 'keychain' }), { hive_keychain: {} })).toBe(false)
    // HiveSigner session with a leftover method (not cleared on logout)
    expect(keychainExpectedButMissing(store({ acti_login_method: 'keychain' }), {})).toBe(false)
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: 'hiveauth' }), {})).toBe(false)
    expect(keychainExpectedButMissing(store({ std_login: 'true', acti_login_method: '' }), {})).toBe(false)
    expect(keychainExpectedButMissing({ getItem: () => { throw new Error('blocked') } }, {})).toBe(false)
  })
})

describe('the notice', () => {
  it('is shown once, then the generic errors that follow it are dropped, for MUTE_MS only', () => {
    let t = 1000
    const notify = jest.fn()
    const n = createKeychainMissingNotice({ notify, message: () => MSG, now: () => t })
    expect(n.allows({ group: 'error', text: 'x' })).toBe(true)
    n.report()
    n.report() // a second refusal in the same action (both-chains vote, retry)
    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'error', text: MSG }))
    expect(n.allows({ group: 'error', text: 'error voting' })).toBe(false)
    expect(n.allows('error voting')).toBe(false)
    // not errors, or clearing toasts: untouched
    expect(n.allows({ group: 'success', text: 'ok' })).toBe(true)
    expect(n.allows({ group: 'warn', text: 'w' })).toBe(true)
    expect(n.allows({ group: 'error', clean: true })).toBe(true)
    t += MUTE_MS
    expect(n.allows({ group: 'error', text: 'later, unrelated' })).toBe(true)
    n.report()
    expect(notify).toHaveBeenCalledTimes(2)
  })
})

describe('plugin', () => {
  let shown
  const install = () => {
    shown = jest.fn()
    Vue.notify = shown
    Vue.prototype.$notify = shown
    plugin({ app: { i18n: { t: (k) => (k === 'keychain_not_detected' ? MSG + " <l'extension>" : k) } } })
  }

  it('is registered client-side, after vue-notification and vue-custom.js', () => {
    const cfg = fs.readFileSync(path.resolve(__dirname, '../../../nuxt.config.js'), 'utf8')
    const at = (s) => cfg.indexOf(s)
    expect(at("{ src: '~/plugins/keychain-missing.js', mode: 'client' }")).toBeGreaterThan(at("{ src: '~plugins/vue-custom.js' }"))
    expect(at("{ src: '~plugins/vue-custom.js' }")).toBeGreaterThan(at("{ src: '~plugins/vue-notification', ssr: false }"))
  })

  it('$keychainMissing: false (nothing shown) when Keychain is there, or for other logins', () => {
    install()
    localStorage.setItem('std_login', 'true')
    localStorage.setItem('acti_login_method', 'keychain')
    window.hive_keychain = {}
    expect(Vue.prototype.$keychainMissing()).toBe(false)
    localStorage.setItem('acti_login_method', '')
    delete window.hive_keychain
    expect(Vue.prototype.$keychainMissing()).toBe(false)
    expect(shown).not.toHaveBeenCalled()
  })

  it('$keychainMissing: true, one escaped notice, and the generic error after it is dropped', () => {
    install()
    keychainSession()
    expect(Vue.prototype.$keychainMissing()).toBe(true)
    new Vue().$notify({ group: 'error', text: 'error voting' })
    Vue.notify({ group: 'error', text: 'error performing operation' })
    new Vue().$notify({ group: 'success', text: 'saved' })
    expect(shown.mock.calls.map(([p]) => p.text)).toEqual([MSG + ' &lt;l&#39;extension&gt;', 'saved'])
  })

  // the path every flow's typed-key fallback takes
  it('every flow: a Keychain session failing through $processTrxFunc shows only the Keychain notice', async () => {
    install()
    keychainSession()
    const vm = new Vue()
    vm.user = { account: { name: 'alice' } }
    vm.$t = (k) => k
    vm.$store = { state: {}, commit: jest.fn() }
    const res = await vm.$processTrxFunc('vote', { voter: 'alice' }, false)
    // what a caller then does on failure
    if (!res.success) vm.$notify({ group: 'error', text: 'error voting' })
    expect(res.success).toBe(false)
    expect(shown).toHaveBeenCalledTimes(1)
    expect(shown.mock.calls[0][0].text).toContain(MSG)
    // nothing was asked for or signed
    expect(requestKey).not.toHaveBeenCalled()
    expect(hive.broadcast.send).not.toHaveBeenCalled()
  })

  it('once per tab, a few seconds after load, when Keychain never showed up', () => {
    jest.useFakeTimers()
    keychainSession()
    install()
    jest.advanceTimersByTime(5000)
    expect(shown).toHaveBeenCalledTimes(1)
    // another page load in the same tab
    install()
    jest.advanceTimersByTime(5000)
    expect(shown).not.toHaveBeenCalled()
  })

  it('no load notice when Keychain arrived in time, or for other logins', () => {
    jest.useFakeTimers()
    keychainSession()
    install()
    window.hive_keychain = {}
    jest.advanceTimersByTime(5000)
    localStorage.setItem('acti_login_method', '')
    delete window.hive_keychain
    install()
    jest.advanceTimersByTime(5000)
    expect(shown).not.toHaveBeenCalled()
  })
})
