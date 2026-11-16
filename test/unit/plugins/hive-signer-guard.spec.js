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
})
