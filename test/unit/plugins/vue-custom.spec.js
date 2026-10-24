// hive-auth-wrapper can open transport on import; stub it so importing the
// plugin (which registers global Vue helpers) has no side effects.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

// Typed-key transactions are now signed IN THE BROWSER by hive-js, not by /performTrx.
// Mock the broadcast (no network) and the key prompt (no UI) so the real signing path in
// $broadcastWithKey runs end to end.
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))
// classifyKey reads the chain; the refusal RULE (keyRefusal) stays real.
jest.mock('@/utils/keyChecks', () => Object.assign({}, jest.requireActual('@/utils/keyChecks'), {
  classifyKey: jest.fn()
}))

import Vue from 'vue'
import { getTransactionErrorMessage } from '@/plugins/vue-custom'
import hive from '@hiveio/hive-js'
import { requestKey } from '@/utils/keyPrompt'
import { classifyKey } from '@/utils/keyChecks'

describe('plugins/vue-custom global helpers', () => {
  describe('getTransactionErrorMessage', () => {
    it('reads the legacy nested transaction error', () => {
      expect(getTransactionErrorMessage({
        error: true,
        trx: { tx: { error: 'missing required posting authority' } }
      })).toBe('missing required posting authority')
    })

    it('reads a top-level error when trx is null', () => {
      expect(getTransactionErrorMessage({
        error: 'broadcast failed',
        trx: null
      })).toBe('broadcast failed')
    })

    it('reads an error object when trx is absent', () => {
      expect(getTransactionErrorMessage({
        error: { message: 'invalid operation' }
      })).toBe('invalid operation')
    })
  })

  // The typed-key branch used to send operations to /performTrx, where the server signed
  // with a posting key it had stored. That is what the incident abused, and /performTrx is
  // permanently disabled - so these tests replace the ones that mocked its responses.
  describe('$processTrxFunc typed-key login: signs in the browser', () => {
    const WIF = '5JdeC9P7Pbd1uGdFVEsJ41EkEnADbbHGq6p1BwFxm6txNBsQnsw'
    let committed

    const makeContext = (storedKey) => {
      committed = []
      const ctx = {
        user: { account: { name: 'alice' } },
        $notify: jest.fn(),
        $t: (key) => key,
        $store: {
          state: { chatPostingKey: storedKey },
          commit: (name, val) => committed.push([name, val])
        }
      }
      // $processTrxFunc delegates to this; on a real component Vue provides it.
      ctx.$broadcastWithKey = Vue.prototype.$broadcastWithKey
      return ctx
    }

    beforeEach(() => {
      localStorage.clear()
      localStorage.setItem('std_login', 'true')
      localStorage.setItem('acti_login_method', '')
      hive.broadcast.send.mockReset()
      requestKey.mockReset()
    })
    afterEach(() => localStorage.clear())

    it('never calls /performTrx', async () => {
      global.fetch = jest.fn()
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'abc' }))

      await Vue.prototype.$processTrxFunc.call(makeContext(WIF), 'vote', {}, false)

      expect(global.fetch).not.toHaveBeenCalled()
      delete global.fetch
    })

    it('signs with the in-memory posting key and returns the transaction id', async () => {
      hive.broadcast.send.mockImplementation((tx, keys, cb) =>
        cb(null, { id: 'deadbeef', ref_block_num: 42 }))

      const result = await Vue.prototype.$processTrxFunc.call(makeContext(WIF), 'vote', { weight: 1 }, false)

      expect(result).toEqual({ success: true, trx: { tx: { id: 'deadbeef', ref_block_num: 42 } } })
      expect(hive.broadcast.send.mock.calls[0][0].operations).toEqual([['vote', { weight: 1 }]])
      // no prompt: the key was already in memory
      expect(requestKey).not.toHaveBeenCalled()
    })

    it('passes keys as an OBJECT keyed by role, never a bare string', async () => {
      // hive-js signs with `for (k in keys)`. A string would iterate its CHARACTERS and
      // sign with garbage.
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'x' }))

      await Vue.prototype.$processTrxFunc.call(makeContext(WIF), 'vote', {}, false)

      expect(hive.broadcast.send.mock.calls[0][1]).toEqual({ posting: WIF })
    })

    it('asks for the posting key when memory is empty (after a reload), and keeps it', async () => {
      requestKey.mockResolvedValue(WIF)
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'x' }))

      const result = await Vue.prototype.$processTrxFunc.call(makeContext(null), 'vote', {}, false)

      expect(requestKey).toHaveBeenCalledWith('posting', 'alice', [['vote', {}]])
      expect(committed).toContainEqual(['setChatPostingKey', WIF])
      expect(result.success).toBe(true)
    })

    it('requests the ACTIVE key per action and never stores it', async () => {
      requestKey.mockResolvedValue(WIF)
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'x' }))

      await Vue.prototype.$processTrxFunc.call(makeContext('posting-key-in-memory'), 'transfer', {}, true)

      expect(requestKey).toHaveBeenCalledWith('active', 'alice', [['transfer', {}]])
      expect(hive.broadcast.send.mock.calls[0][1]).toEqual({ active: WIF })
      // an active key can move funds: it must not end up in the store
      expect(committed.filter(([name]) => name === 'setChatPostingKey')).toEqual([])
    })

    it('a cancelled prompt fails quietly, without a red toast', async () => {
      requestKey.mockResolvedValue(null)
      const ctx = makeContext(null)

      const result = await Vue.prototype.$processTrxFunc.call(ctx, 'vote', {}, false)

      expect(result).toEqual({ success: false, trx: null, error: 'signing_cancelled' })
      expect(ctx.$notify).not.toHaveBeenCalled()
      expect(hive.broadcast.send).not.toHaveBeenCalled()
    })

    it('surfaces a broadcast error, with a toast', async () => {
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(new Error('broadcast failed')))
      const ctx = makeContext(WIF)

      const result = await Vue.prototype.$processTrxFunc.call(ctx, 'vote', {}, false)

      expect(result).toEqual({ success: false, trx: null, error: 'broadcast failed' })
      expect(ctx.$notify).toHaveBeenCalledWith(expect.objectContaining({ text: 'broadcast failed' }))
    })

    it('drops a posting key that has lost its authority, so it is not retried', async () => {
      // e.g. the user rotated their key - exactly what the security notice asks them to do
      hive.broadcast.send.mockImplementation((tx, keys, cb) =>
        cb(new Error('missing required posting authority: Missing Posting Authority alice')))

      await Vue.prototype.$processTrxFunc.call(makeContext(WIF), 'vote', {}, false)

      expect(committed).toContainEqual(['setChatPostingKey', null])
    })
  })

  // /memoDecode had the SERVER decrypt with a stored key. connectSession3S (3Speak) never
  // branched by login method, so with that route gone it was dead for everyone.
  describe('$decodeMemo', () => {
    const ctx = (storedKey) => {
      const c = {
        user: { account: { name: 'alice' } },
        $t: (k) => k,
        $store: { state: { chatPostingKey: storedKey }, commit: jest.fn() }
      }
      return c
    }
    beforeEach(() => {
      hive.memo.decode.mockReset()
      requestKey.mockReset()
      localStorage.clear()
    })
    afterEach(() => { delete window.hive_keychain; localStorage.clear() })

    it('decrypts locally with the typed key, returning the /memoDecode shape', async () => {
      localStorage.setItem('acti_login_method', '')
      hive.memo.decode.mockReturnValue('#token123')

      const out = await Vue.prototype.$decodeMemo.call(ctx('wif'), '#encrypted')

      expect(out).toEqual({ xcstkn: '#token123' })
      expect(hive.memo.decode).toHaveBeenCalledWith('wif', '#encrypted')
    })

    it('decrypts in the Keychain extension for Keychain users - never locally', async () => {
      localStorage.setItem('acti_login_method', 'keychain')
      window.hive_keychain = {
        requestVerifyKey: jest.fn((user, memo, role, cb) => cb({ success: true, result: '#tok' }))
      }

      const out = await Vue.prototype.$decodeMemo.call(ctx(null), '#encrypted')

      expect(out).toEqual({ xcstkn: '#tok' })
      expect(window.hive_keychain.requestVerifyKey)
        .toHaveBeenCalledWith('alice', '#encrypted', 'Posting', expect.any(Function))
      expect(hive.memo.decode).not.toHaveBeenCalled()
    })

    it('reports a refused Keychain prompt as cancelled', async () => {
      localStorage.setItem('acti_login_method', 'keychain')
      window.hive_keychain = { requestVerifyKey: jest.fn((u, m, r, cb) => cb({ success: false })) }

      const out = await Vue.prototype.$decodeMemo.call(ctx(null), '#encrypted')

      expect(out).toEqual({ error: 'signing_cancelled' })
    })

    it('asks for the posting key when memory is empty', async () => {
      localStorage.setItem('acti_login_method', '')
      requestKey.mockResolvedValue('prompted-wif')
      hive.memo.decode.mockReturnValue('#t')

      await Vue.prototype.$decodeMemo.call(ctx(null), '#encrypted')

      expect(requestKey).toHaveBeenCalledWith('posting', 'alice', expect.any(Array))
      expect(hive.memo.decode).toHaveBeenCalledWith('prompted-wif', '#encrypted')
    })

    it('returns an error rather than throwing on a bad memo', async () => {
      localStorage.setItem('acti_login_method', '')
      hive.memo.decode.mockImplementation(() => { throw new Error('Invalid memo') })

      await expect(Vue.prototype.$decodeMemo.call(ctx('wif'), '#junk'))
        .resolves.toEqual({ error: 'Invalid memo' })
    })
  })

  describe('$broadcastWithKey', () => {
    beforeEach(() => { hive.broadcast.send.mockReset(); requestKey.mockReset() })

    const ctx = () => ({
      user: { account: { name: 'alice' } },
      $t: (k) => k,
      $store: { state: { chatPostingKey: 'k' }, commit: jest.fn() }
    })

    it('returns the shape /performTrx used to, so direct callers need no other change', async () => {
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(new Error('boom')))
      const out = await Vue.prototype.$broadcastWithKey.call(ctx(), [['vote', {}]], {})
      // callers read outcome.error and outcome.trx.tx.error
      expect(out.error).toBe(true)
      expect(out.trx.tx.error).toBe('boom')
    })

    it('broadcasts several operations at once (e.g. a vote plus its options)', async () => {
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'x' }))
      const ops = [['comment', {}], ['comment_options', {}]]
      await Vue.prototype.$broadcastWithKey.call(ctx(), ops, {})
      expect(hive.broadcast.send.mock.calls[0][0].operations).toEqual(ops)
    })

    it('uses a key the caller already collected instead of prompting again', async () => {
      // the buy-now flows ask for the active key in their own form
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'x' }))
      classifyKey.mockResolvedValue('active')
      await Vue.prototype.$broadcastWithKey.call(ctx(), [['transfer', {}]], { active: true, wif: 'typed-active' })
      expect(requestKey).not.toHaveBeenCalled()
      expect(hive.broadcast.send.mock.calls[0][1]).toEqual({ active: 'typed-active' })
    })

    it('refuses Steem and Blurt plainly - a typed key here is a Hive key', async () => {
      for (const bchain of ['STEEM', 'BLURT', 'steem']) {
        const out = await Vue.prototype.$broadcastWithKey.call(ctx(), [['vote', {}]], { bchain })
        expect(out.error).toBe(true)
        expect(out.trx.tx.error).toBe('typed_key_hive_only')
      }
      expect(hive.broadcast.send).not.toHaveBeenCalled()
    })

    it('treats a missing or empty chain as Hive', async () => {
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'x' }))
      // wallet.vue defaults cur_bchain to '' rather than 'HIVE'
      for (const bchain of [undefined, '', null, 'HIVE', 'hive']) {
        const out = await Vue.prototype.$broadcastWithKey.call(ctx(), [['vote', {}]], { bchain })
        expect(out.success).toBe(true)
      }
    })
  })

  describe('$processTrxFunc Keychain cancellation', () => {
    beforeEach(() => {
      localStorage.clear()
      localStorage.setItem('std_login', 'true')
      localStorage.setItem('acti_login_method', 'keychain')
    })

    afterEach(() => {
      delete window.hive_keychain
      localStorage.clear()
    })

    it('settles cleanly when Keychain returns a null result', async () => {
      window.hive_keychain = {
        requestBroadcast: jest.fn((account, operations, authority, callback) => {
          callback({ success: false, result: null, message: 'User cancelled' })
        })
      }
      const context = { user: { account: { name: 'alice' } } }

      const result = await Vue.prototype.$processTrxFunc.call(context, 'account_update2', {}, false)

      expect(result).toEqual({
        success: false,
        txID: null,
        trx: null,
        error: 'User cancelled'
      })
      expect(window.hive_keychain.requestBroadcast).toHaveBeenCalledWith(
        'alice',
        [['account_update2', {}]],
        'Posting',
        expect.any(Function)
      )
    })

    it('returns the transaction id after a successful broadcast', async () => {
      window.hive_keychain = {
        requestBroadcast: jest.fn((account, operations, authority, callback) => {
          callback({ success: true, result: { id: 'trx-123' } })
        })
      }
      const context = { user: { account: { name: 'alice' } } }

      const result = await Vue.prototype.$processTrxFunc.call(context, 'account_update2', {}, false)

      expect(result).toEqual({
        success: true,
        txID: 'trx-123',
        trx: { tx: { id: 'trx-123' } }
      })
    })

    it('does not report success without a transaction id', async () => {
      window.hive_keychain = {
        requestBroadcast: jest.fn((account, operations, authority, callback) => {
          callback({ success: true, result: null })
        })
      }
      const context = { user: { account: { name: 'alice' } } }

      const result = await Vue.prototype.$processTrxFunc.call(context, 'account_update2', {}, false)

      expect(result).toEqual({ success: false, txID: null, trx: null })
    })

  })

  describe('$numberFormat', () => {
    it('formats integers with thousands separators', () => {
      expect(Vue.prototype.$numberFormat(1234567, 0)).toBe('1,234,567')
    })

    it('respects the precision (max fraction digits) argument', () => {
      expect(Vue.prototype.$numberFormat(3.14159, 2)).toBe('3.14')
      expect(Vue.prototype.$numberFormat(3.1, 0)).toBe('3')
    })
  })

  describe('$getDaysDifference', () => {
    it('returns whole days between two dates', () => {
      expect(Vue.prototype.$getDaysDifference('2024-01-01', '2024-01-11')).toBe(10)
    })

    it('is order-independent (uses absolute difference)', () => {
      expect(Vue.prototype.$getDaysDifference('2024-01-11', '2024-01-01')).toBe(10)
    })

    it('returns 0 for the same date', () => {
      expect(Vue.prototype.$getDaysDifference('2024-05-05', '2024-05-05')).toBe(0)
    })
  })

  describe('$getTimeDifference', () => {
    // Hive/Steem APIs return UTC wall-clock timestamps WITHOUT a 'Z' designator
    // (e.g. "2024-01-15T10:30:00"). Date.parse() reads those as local time, and
    // the helper's "- getTimezoneOffset()" term corrects for exactly that, so the
    // result is accurate in any timezone. We must feed the realistic format.
    const hiveTimestamp = (msAgo) => new Date(Date.now() - msAgo).toISOString().slice(0, 19)

    it('reports minutes for a recent timestamp', () => {
      expect(Vue.prototype.$getTimeDifference(hiveTimestamp(5 * 60 * 1000))).toBe('5 min(s) ago')
    })

    it('reports hours for a timestamp a few hours old', () => {
      expect(Vue.prototype.$getTimeDifference(hiveTimestamp(3 * 60 * 60 * 1000))).toBe('3 hour(s) ago')
    })

    it('reports days for a timestamp several days old', () => {
      expect(Vue.prototype.$getTimeDifference(hiveTimestamp(4 * 24 * 60 * 60 * 1000))).toBe('4 day(s) ago')
    })

    it('reports weeks for a timestamp a couple weeks old', () => {
      expect(Vue.prototype.$getTimeDifference(hiveTimestamp(14 * 24 * 60 * 60 * 1000))).toBe('2 week(s) ago')
    })
  })

  describe('$cleanBody (client sanitize path)', () => {
    // The reported stored-XSS fired in the browser (DOMPurify) path, so exercise it.
    beforeAll(() => { process.client = true })
    afterAll(() => { delete process.client })

    const clean = (body) => Vue.prototype.$cleanBody(body, false, false)

    // Parse the returned HTML the way the browser will and assert the real
    // security property: no element carries an on* event-handler attribute
    // (a "onerror" substring surviving as inert text content is harmless).
    const eventHandlerAttrs = (html) => {
      const root = document.createElement('div')
      root.innerHTML = html
      return Array.from(root.querySelectorAll('*'))
        .flatMap(el => Array.from(el.attributes).map(a => a.name))
        .filter(name => /^on/i.test(name))
    }

    // --- Security: the reported payloads must be neutralised ---
    it('neutralises the markdown-image src breakout XSS (adjacent form)', () => {
      const html = clean('![x](https://z.gif" onerror="alert(document.domain))')
      expect(eventHandlerAttrs(html)).toEqual([])
      expect(html).not.toContain('<script')
    })

    it('neutralises the whitespace-variant that dodged the link pass', () => {
      const html = clean('![x] (https://z.gif" onerror="alert(document.domain))')
      expect(eventHandlerAttrs(html)).toEqual([])
      expect(html).not.toContain('<script')
    })

    it('escapes a quote in an image URL instead of breaking out of src', () => {
      const html = clean('foo https://evil.com/a.png" onerror="alert(1) bar')
      expect(eventHandlerAttrs(html)).toEqual([])
      // the img that IS produced must carry only a clean, single-URL src
      const root = document.createElement('div')
      root.innerHTML = html
      root.querySelectorAll('img').forEach(img => {
        expect(img.getAttribute('src')).not.toMatch(/["\s]/)
      })
    })

    // --- Functionality: media/mentions must still render ---
    it('still proxies a bare image URL through images.hive.blog', () => {
      const html = clean('https://example.com/pic.png')
      expect(html).toContain('<img')
      expect(html).toContain('images.hive.blog/0x0/https://example.com/pic.png')
    })

    it('passes .gif URLs through without proxying', () => {
      const html = clean('https://example.com/a.gif')
      expect(html).toContain('<img')
      expect(html).toContain('https://example.com/a.gif')
      expect(html).not.toContain('images.hive.blog/0x0/')
    })

    it('still renders a YouTube embed as a trusted iframe', () => {
      const html = clean('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(html).toContain('<iframe')
      expect(html).toContain('youtube.com/embed/dQw4w9WgXcQ')
    })

    it('still renders a 3Speak watch URL as a trusted iframe', () => {
      const html = clean('https://3speak.tv/watch?v=user/abcdefg')
      expect(html).toContain('<iframe')
      expect(html).toContain('3speak.tv/watch?v=user/abcdefg')
    })

    it('renders the play.3speak.tv/embed?v= URL form as an embedded player', () => {
      const html = clean('https://play.3speak.tv/embed?v=dmann/g8uv7nzq')
      expect(html).toContain('<iframe')
      // normalised to the canonical iframe player URL (& may be entity-encoded as &amp;)
      expect(html).toMatch(/play\.3speak\.tv\/watch\?v=dmann\/g8uv7nzq&(?:amp;)?mode=iframe/)
      expect(html).not.toMatch(/<a[^>]*play\.3speak\.tv\/embed/)
    })

    it('still renders @mentions as actifit links', () => {
      const html = clean('hello @cr0w how are you')
      expect(html).toContain('href="https://actifit.io/@cr0w"')
    })
  })

  describe('$fetchReportTags', () => {
    beforeAll(() => { process.client = false }) // exercise the SSR regex-strip path
    afterAll(() => { delete process.client })

    it('renders sanitized tag spans from json_metadata (string form)', () => {
      const report = { json_metadata: JSON.stringify({ tags: ['fitness', 'health'] }) }
      const html = Vue.prototype.$fetchReportTags(report)
      expect(html).toContain('fitness')
      expect(html).toContain('health')
      expect(html).toContain('single-tag')
    })

    it('strips HTML out of tags', () => {
      const report = { json_metadata: { tags: ['<b>bold</b>'] } }
      const html = Vue.prototype.$fetchReportTags(report)
      expect(html).not.toContain('<b>')
      expect(html).toContain('bold')
    })

    it('returns empty string when there is no metadata', () => {
      expect(Vue.prototype.$fetchReportTags({})).toBe('')
      expect(Vue.prototype.$fetchReportTags(null)).toBe('')
    })
  })

  // The buy-now forms collect the active key themselves and pass it as options.wif,
  // skipping the prompt. That path signs PAYMENTS, so it gets the prompt's checks.
  describe('$broadcastWithKey with a caller-supplied key', () => {
    const ctx = () => ({
      user: { account: { name: 'alice' } },
      $t: (k) => k,
      $store: { state: { chatPostingKey: null }, commit: jest.fn() }
    })
    const pay = (wif) => Vue.prototype.$broadcastWithKey.call(ctx(), [['transfer', { amount: '1.000 HIVE' }]],
      { active: true, wif })
    beforeEach(() => {
      hive.broadcast.send.mockReset()
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(null, { id: 'x' }))
      classifyKey.mockReset()
    })

    it.each([
      ['owner', 'key_prompt_owner_refused'],
      ['posting', 'key_prompt_not_active'],
      ['none', 'key_prompt_not_active'],
      ['invalid', 'key_prompt_invalid'],
      // a failed lookup is NOT waved through: the key would sign a payment unchecked
      ['unknown', 'key_prompt_check_failed']
    ])('refuses a %s key before signing anything', async (kind, reason) => {
      classifyKey.mockResolvedValue(kind)
      const out = await pay('5Ksomething')
      expect(out.error).toBe(true)
      expect(out.trx.tx.error).toBe(reason)
      expect(hive.broadcast.send).not.toHaveBeenCalled()
    })

    it('signs with a verified active key, trimmed', async () => {
      classifyKey.mockResolvedValue('active')
      const out = await pay('  5Kactive  ')
      expect(classifyKey).toHaveBeenCalledWith('alice', '5Kactive')
      expect(hive.broadcast.send.mock.calls[0][1]).toEqual({ active: '5Kactive' })
      expect(out.success).toBe(true)
    })
  })

  // vue-notification renders toast text with v-html, and the message can come from an
  // RPC node. Escaped once at the source, so every caller is covered.
  describe('broadcast error messages are HTML-escaped', () => {
    const XSS = '<img src=x onerror=alert(1)>'
    const ctx = () => ({
      user: { account: { name: 'alice' } },
      $t: (k) => k,
      $notify: jest.fn(),
      $store: { state: { chatPostingKey: 'k' }, commit: jest.fn() }
    })
    beforeEach(() => {
      hive.broadcast.send.mockReset()
      hive.broadcast.send.mockImplementation((tx, keys, cb) => cb(new Error(XSS)))
    })

    it('in the $broadcastWithKey result', async () => {
      const out = await Vue.prototype.$broadcastWithKey.call(ctx(), [['vote', {}]], {})
      expect(out.trx.tx.error).toBe('&lt;img src=x onerror=alert(1)&gt;')
    })

    it('in the $processTrxFunc toast', async () => {
      localStorage.setItem('std_login', 'true')
      localStorage.setItem('acti_login_method', '')
      const c = ctx()
      c.$broadcastWithKey = Vue.prototype.$broadcastWithKey
      await Vue.prototype.$processTrxFunc.call(c, 'vote', {}, false)
      const text = c.$notify.mock.calls[0][0].text
      expect(text).not.toContain('<img')
      expect(text).toContain('&lt;img')
      localStorage.clear()
    })
  })

  describe('purchase confirmation helpers', () => {
    it('$confirmFailed treats BOTH failure shapes as failure', () => {
      const failed = Vue.prototype.$confirmFailed
      // {status:'error'} is what the on-chain verified routes answer - and what the
      // purchase flows used to show as success
      expect(failed({ status: 'error' })).toBe(true)
      expect(failed({ error: 'Transaction already verified' })).toBe(true)
      expect(failed(null)).toBe(true)
      expect(failed({ status: 'Success' })).toBe(false)
      expect(failed({ status: 'success' })).toBe(false)
    })

    it('$signsInBrowser: Keychain, HiveAuth and typed key yes; HiveSigner no', () => {
      localStorage.clear()
      expect(Vue.prototype.$signsInBrowser()).toBe(false)
      localStorage.setItem('std_login', 'true')
      expect(Vue.prototype.$signsInBrowser()).toBe(true)
      localStorage.clear()
    })

    it('$signingErrorText reads every failure shape, never throws, escapes', () => {
      const text = (r) => Vue.prototype.$signingErrorText.call({ $t: (k) => k }, r)
      expect(text({ error: true, trx: { tx: { error: 'already &lt;escaped&gt;' } } })).toBe('already &lt;escaped&gt;')
      expect(text({ success: false, error: '<b>keychain</b>' })).toBe('&lt;b&gt;keychain&lt;/b&gt;')
      expect(text({ cause: { message: 'hive-js' } })).toBe('hive-js')
      expect(text(new Error('plain'))).toBe('plain')
      // the old code read res.cause.message unconditionally: these threw
      expect(text(true)).toBe('error_performing_operation')
      expect(text(undefined)).toBe('error_performing_operation')
    })

    it('$notifyPaymentNotConfirmed: persistent toast, escaped tx id', () => {
      const c = { $t: () => 'sent: _TX_', $notify: jest.fn() }
      const msg = Vue.prototype.$notifyPaymentNotConfirmed.call(c, '<x>')
      expect(msg).toBe('sent: &lt;x&gt;')
      expect(c.$notify).toHaveBeenCalledWith(expect.objectContaining({ group: 'error', text: msg, duration: -1 }))
    })
  })
})
