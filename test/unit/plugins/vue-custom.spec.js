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
