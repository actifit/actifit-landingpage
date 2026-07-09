// hive-auth-wrapper can open transport on import; stub it so importing the
// plugin (which registers global Vue helpers) has no side effects.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import Vue from 'vue'
import '@/plugins/vue-custom'

describe('plugins/vue-custom global helpers', () => {
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
})
