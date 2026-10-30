/**
 * The CSP report endpoint takes unauthenticated, attacker-controllable input and
 * writes it to the logs. These tests pin that it keeps only a few clipped fields,
 * drops query strings, rate-limits repeats, and refuses oversized or non-POST
 * requests. A last block pins the policy itself in nuxt.config.js.
 */
const { EventEmitter } = require('events')
const handler = require('../../../api/csp-report')
const { normalise, record, seen } = handler._test

const send = (body, { method = 'POST' } = {}) => new Promise((resolve) => {
  const req = new EventEmitter()
  req.method = method
  req.destroy = jest.fn()
  const res = { statusCode: 200, end: () => resolve({ res, req }) }
  handler(req, res)
  if (method === 'POST') {
    req.emit('data', Buffer.from(body))
    req.emit('end')
  }
})

const legacy = (over = {}) => JSON.stringify({
  'csp-report': {
    'document-uri': 'https://actifit.io/@alice?token=secret',
    'effective-directive': 'script-src-elem',
    'blocked-uri': 'https://evil.example/x.js?k=1',
    'source-file': 'https://actifit.io/_nuxt/app.js',
    disposition: 'report',
    ...over,
  },
})

let log
beforeEach(() => {
  seen.clear()
  log = jest.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => log.mockRestore())

describe('api/csp-report', () => {
  test('logs a legacy report-uri body as one compact line, without query strings', async () => {
    const { res } = await send(legacy())
    expect(res.statusCode).toBe(204)
    expect(log).toHaveBeenCalledTimes(1)
    const line = log.mock.calls[0][0]
    expect(line.startsWith('[csp] ')).toBe(true)
    const v = JSON.parse(line.slice(6))
    expect(v).toMatchObject({
      directive: 'script-src-elem',
      blocked: 'https://evil.example/x.js',
      page: 'https://actifit.io/@alice',
      source: 'https://actifit.io/_nuxt/app.js',
    })
    expect(line).not.toContain('secret')
  })

  test('accepts the Reporting API body too', () => {
    const [v] = normalise([{ type: 'csp-violation', body: { effectiveDirective: 'img-src', blockedURL: 'inline', documentURL: 'https://actifit.io/' } }])
    expect(v).toMatchObject({ directive: 'img-src', blocked: 'inline', page: 'https://actifit.io/' })
  })

  test('clips long values', () => {
    const [v] = normalise({ 'csp-report': { 'blocked-uri': 'x'.repeat(5000), 'script-sample': 'y'.repeat(5000) } })
    expect(v.blocked.length).toBeLessThanOrEqual(200)
    expect(v.sample.length).toBeLessThanOrEqual(80)
  })

  test('logs a repeated violation once per hour', async () => {
    await send(legacy())
    await send(legacy())
    await send(legacy({ 'blocked-uri': 'https://other.example/y.js' }))
    expect(log).toHaveBeenCalledTimes(2)
    const v = { directive: 'd', blocked: 'b', source: 's' }
    expect(record(v, 0)).toBe(true)
    expect(record(v, 1000)).toBe(false)
    expect(record(v, 60 * 60 * 1000)).toBe(true)
  })

  test('ignores malformed JSON but still answers 204', async () => {
    const { res } = await send('not json')
    expect(res.statusCode).toBe(204)
    expect(log).not.toHaveBeenCalled()
  })

  test('refuses a body over 16 KB', async () => {
    const { res, req } = await send('x'.repeat(17 * 1024))
    expect(res.statusCode).toBe(413)
    expect(req.destroy).toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
  })

  test('refuses anything but POST', async () => {
    const { res } = await send('', { method: 'GET' })
    expect(res.statusCode).toBe(405)
  })
})

describe('render.csp in nuxt.config.js', () => {
  const { csp } = require('../../../nuxt.config.js').render
  const p = csp.policies

  test('hashes inline scripts and reports to our endpoint', () => {
    expect(csp.hashAlgorithm).toBe('sha256')
    expect(p['report-uri']).toEqual(['/api/csp-report'])
  })

  test('script-src never allows inline or eval, and plugins are off', () => {
    expect(p['script-src']).not.toContain("'unsafe-inline'")
    expect(p['script-src']).not.toContain("'unsafe-eval'")
    expect(p['script-src'].some((s) => s === 'https:' || s === '*')).toBe(false)
    expect(p['object-src']).toEqual(["'none'"])
    expect(p['base-uri']).toEqual(["'self'"])
  })
})

describe('api/csp-head-hashes', () => {
  const { headHashes, addHeadHashes } = require('../../../api/csp-head-hashes')
  const crypto = require('crypto')
  const sha = (s) => `'sha256-${crypto.createHash('sha256').update(s).digest('base64')}'`
  const GTM = "if(!window._gtm_init){window._gtm_init=1}"

  test('hashes the trusted GTM script in <head>', () => {
    const html = `<html><head><script data-n-head="ssr" data-hid="gtm-script">${GTM}</script></head><body></body></html>`
    expect(headHashes(html)).toEqual([sha(GTM)])
  })

  test('ignores untrusted hids, src scripts, and anything in <body>', () => {
    const html = '<html><head>' +
      '<script data-n-head="ssr" data-hid="other">alert(1)</script>' +
      '<script data-hid="gtm-script" src="https://x/y.js"></script>' +
      '<script>alert(2)</script>' +
      '</head><body><script data-n-head="ssr" data-hid="gtm-script">alert(3)</script></body></html>'
    expect(headHashes(html)).toEqual([])
  })

  test('adds hashes to the array Nuxt builds the header from, once', () => {
    const html = `<head><script data-hid="gtm-script">${GTM}</script></head>`
    const result = { html, cspScriptSrcHashes: ["'sha256-nuxt'"] }
    addHeadHashes('/', result)
    addHeadHashes('/', result)
    expect(result.cspScriptSrcHashes).toEqual(["'sha256-nuxt'", sha(GTM)])
    expect(() => addHeadHashes('/', {})).not.toThrow()
  })
})
