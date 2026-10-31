/**
 * The CSP report-uri stays on a sample of rendered pages only; the rest of the
 * policy is unchanged on every page.
 */
const { makeSampler, withoutReportUri, sampleRate } = require('../../../api/csp-report-sample')

const POLICY = "default-src 'self'; script-src 'self' 'sha256-abc'; object-src 'none'; report-uri /api/csp-report"

function fakeRes (headers) {
  const store = { ...headers }
  return {
    getHeader: (n) => store[n],
    setHeader: (n, v) => { store[n] = v },
    store
  }
}

describe('csp-report-sample', () => {
  it('removes only the report-uri directive', () => {
    expect(withoutReportUri(POLICY)).toBe("default-src 'self'; script-src 'self' 'sha256-abc'; object-src 'none'")
    expect(withoutReportUri("default-src 'self'")).toBe("default-src 'self'")
  })

  it('drops report-uri on pages outside the sample', () => {
    const res = fakeRes({ 'Content-Security-Policy-Report-Only': POLICY })
    makeSampler(0.02, () => 0.5)('/x', {}, { res })
    expect(res.store['Content-Security-Policy-Report-Only']).not.toMatch(/report-uri/)
    expect(res.store['Content-Security-Policy-Report-Only']).toMatch(/object-src 'none'/)
  })

  it('keeps report-uri on sampled pages', () => {
    const res = fakeRes({ 'Content-Security-Policy-Report-Only': POLICY })
    makeSampler(0.02, () => 0.01)('/x', {}, { res })
    expect(res.store['Content-Security-Policy-Report-Only']).toBe(POLICY)
  })

  it('also handles an enforced policy, and ignores responses without one', () => {
    const res = fakeRes({ 'Content-Security-Policy': POLICY })
    makeSampler(0, () => 0.5)('/x', {}, { res })
    expect(res.store['Content-Security-Policy']).not.toMatch(/report-uri/)
    const none = fakeRes({})
    expect(() => makeSampler(0, () => 0.5)('/x', {}, { res: none })).not.toThrow()
    expect(() => makeSampler(0, () => 0.5)('/x', {}, {})).not.toThrow()
  })

  it('reads the rate from CSP_REPORT_SAMPLE, defaulting to 2%', () => {
    expect(sampleRate(undefined)).toBe(0.02)
    expect(sampleRate('')).toBe(0.02)
    expect(sampleRate('0.1')).toBe(0.1)
    expect(sampleRate('1')).toBe(1)
    expect(sampleRate('2')).toBe(0.02)
    expect(sampleRate('abc')).toBe(0.02)
  })
})
