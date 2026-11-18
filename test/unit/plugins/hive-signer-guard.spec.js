// The guard only helps if the plugin is registered and wires the message correctly.
import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import plugin from '~/plugins/hive-signer-guard'

describe('hive-signer-guard plugin', () => {
  it('is registered client-side, after vue-custom.js (which sets $HAS)', () => {
    const cfg = fs.readFileSync(path.resolve(__dirname, '../../../nuxt.config.js'), 'utf8')
    const custom = cfg.indexOf("{ src: '~plugins/vue-custom.js' }")
    const guard = cfg.indexOf("{ src: '~/plugins/hive-signer-guard.js', mode: 'client' }")
    expect(custom).toBeGreaterThan(-1)
    expect(guard).toBeGreaterThan(custom)
  })

  // A refused (or cancelled) Keychain delete used to show "Delete_Success", and the post
  // page then navigated away from a post that was not deleted.
  it.each(['components/Comments.vue', 'pages/_username/_permlink/index.vue'])('%s: a Keychain delete succeeds only if Keychain says so', (file) => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../..', file), 'utf8')
    expect(src).toContain('this.deleteSuccess(response && response.success ? null : true);')
    // HiveAuth: a refused or declined delete stops the spinner too
    expect(src).toMatch(/response\.cmd === 'sign_nack'\) \{\s*resolve\(\{ success: false \}\)\s*\/\/[^\n]*\n\s*if \(op_name == 'delete_comment'\) this\.deleteSuccess\(true\);/)
  })

  it('refuses with the translated message naming the chain, as an error toast', async () => {
    const prev = { HAS: Vue.prototype.$HAS, notify: Vue.notify, kc: window.hive_keychain }
    const original = jest.fn(() => Promise.resolve({ cmd: 'sign_ack' }))
    Vue.prototype.$HAS = { broadcast: original }
    Vue.notify = jest.fn()
    window.hive_keychain = { requestBroadcast: jest.fn() }
    localStorage.setItem('cur_bchain', 'BLURT')
    try {
      plugin({ app: { i18n: { t: (k) => (k === 'signer_hive_only' ? 'Only Hive. Not on _CHAIN_.' : k) } } })
      const res = await Vue.prototype.$HAS.broadcast({}, 'posting', [['vote', {}]], () => {})
      expect(original).not.toHaveBeenCalled()
      expect(res.message).toBe('Only Hive. Not on Blurt.')
      expect(Vue.notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'error', text: 'Only Hive. Not on Blurt.' }))
      // and Keychain, already present, is wrapped too
      const cb = jest.fn()
      window.hive_keychain.requestBroadcast('alice', [['vote', {}]], 'Posting', cb)
      await new Promise((r) => setTimeout(r, 0))
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'chain_not_supported' }))
    } finally {
      Vue.prototype.$HAS = prev.HAS
      Vue.notify = prev.notify
      window.hive_keychain = prev.kc
      localStorage.removeItem('cur_bchain')
    }
  })

  it('a Keychain object assigned later, or replacing the first, is wrapped too', async () => {
    const prevNotify = Vue.notify
    Vue.notify = jest.fn()
    localStorage.setItem('cur_bchain', 'BLURT')
    try {
      plugin({ app: { i18n: { t: () => 'Only Hive. Not on _CHAIN_.' } } })
      for (const late of [{ requestVote: jest.fn() }, { requestVote: jest.fn() }]) {
        const original = late.requestVote
        window.hive_keychain = late
        const cb = jest.fn()
        window.hive_keychain.requestVote('alice', 'p', 'bob', 10000, cb)
        await new Promise((r) => setTimeout(r, 0))
        expect(window.hive_keychain).toBe(late)
        expect(original).not.toHaveBeenCalled()
        expect(cb).toHaveBeenCalledWith(expect.objectContaining({ error: 'chain_not_supported' }))
      }
    } finally {
      Vue.notify = prevNotify
      localStorage.removeItem('cur_bchain')
    }
  })

  // A Keychain defined in a way the window.hive_keychain trap cannot see, appearing after the
  // timers: it is wrapped before the user action that would use it, including a bare click
  // (screen readers, voice control) and a form submit.
  it.each(['pointerdown', 'keydown', 'click', 'submit'])('a Keychain the trap missed is wrapped on %s, before the site\'s handlers', async (type) => {
    const prevNotify = Vue.notify
    Vue.notify = jest.fn()
    localStorage.setItem('cur_bchain', 'BLURT')
    try {
      plugin({ app: { i18n: { t: () => 'Only Hive. Not on _CHAIN_.' } } })
      const late = { requestVote: jest.fn() }
      const original = late.requestVote
      Object.defineProperty(window, 'hive_keychain', { value: late, configurable: true, writable: true })
      const cb = jest.fn()
      // the site's own handler, on the target (runs after capture-phase listeners)
      const target = document.createElement(type === 'submit' ? 'form' : 'button')
      document.body.appendChild(target)
      target.addEventListener(type, () => window.hive_keychain.requestVote('alice', 'p', 'bob', 10000, cb))
      target.dispatchEvent(new Event(type, { bubbles: true }))
      await new Promise((r) => setTimeout(r, 0))
      expect(original).not.toHaveBeenCalled()
      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ error: 'chain_not_supported' }))
      target.remove()
    } finally {
      Vue.notify = prevNotify
      localStorage.removeItem('cur_bchain')
      delete window.hive_keychain
    }
  })

  it('a provider that cannot be wrapped is reported once, not on every key press', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      plugin({ app: { i18n: { t: (k) => k } } })
      Object.defineProperty(window, 'hive_keychain', { value: Object.freeze({ requestVote () {} }), configurable: true, writable: true })
      for (let i = 0; i < 5; i++) document.body.dispatchEvent(new Event('keydown', { bubbles: true }))
      expect(warn.mock.calls.filter(([m]) => /cannot wrap/.test(m))).toHaveLength(1)
    } finally {
      warn.mockRestore()
      delete window.hive_keychain
    }
  })

  it('an odd chain value is escaped in the toast (it renders HTML)', async () => {
    const prev = { HAS: Vue.prototype.$HAS, notify: Vue.notify }
    Vue.prototype.$HAS = { broadcast: jest.fn() }
    Vue.notify = jest.fn()
    localStorage.setItem('cur_bchain', '<img src=x onerror=alert(1)>')
    try {
      plugin({ app: { i18n: { t: () => 'Not on _CHAIN_.' } } })
      const res = await Vue.prototype.$HAS.broadcast({}, 'posting', [['vote', {}]], () => {})
      expect(res.message).not.toContain('<')
      expect(res.message).toContain('&lt;IMG SRC=X ONERROR=ALERT(1)&gt;')
    } finally {
      Vue.prototype.$HAS = prev.HAS
      Vue.notify = prev.notify
      localStorage.removeItem('cur_bchain')
    }
  })

  it('HiveAuth session keys are not written to the console', () => {
    for (const file of ['components/CartModal.vue', 'components/Comments.vue', 'pages/settings.vue']) {
      expect(fs.readFileSync(path.resolve(__dirname, '../../..', file), 'utf8')).not.toMatch(/console\.log\(auth\)/)
    }
  })
})
