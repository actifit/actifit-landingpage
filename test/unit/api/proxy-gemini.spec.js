/**
 * The Gemini route spends the site's own API key, for the translate buttons.
 *
 * - Only the translation models are accepted. The route used to forward any model name,
 *   so anyone could run any (and any priced) model on Actifit's key.
 * - It is rate-limited per visitor, like the other proxy routes.
 * - The browser's model list (components/gemini-client.js) and the proxy's allowlist
 *   match, and contain no model Google has retired (the gemini-2.0 fallbacks answered 404,
 *   so a failing gemini-2.5-flash left translation with nothing to fall back to).
 */
import fs from 'fs'
import path from 'path'

const call = (proxy, { model, ip = '1.2.3.4' } = {}) => new Promise((resolve) => {
  const handlers = {}
  const req = {
    method: 'POST',
    url: '/gemini' + (model ? '?model=' + model : ''),
    headers: { 'cf-connecting-ip': ip },
    socket: {},
    on: (ev, fn) => { handlers[ev] = fn },
  }
  const res = {
    statusCode: 200,
    setHeader () {},
    end (body) { resolve({ status: this.statusCode, body: body && JSON.parse(body) }) },
  }
  proxy(req, res, () => {})
  if (handlers.data) handlers.data('{"contents":[{"parts":[{"text":"hi"}]}]}')
  if (handlers.end) handlers.end()
})

describe('api/proxy /gemini', () => {
  let proxy, post
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key'
    post = jest.fn().mockResolvedValue({ data: { candidates: [{ content: { parts: [{ text: 'hello' }] } }] } })
    jest.isolateModules(() => {
      jest.doMock('axios', () => ({ create: () => ({ post, interceptors: { request: { use () {} }, response: { use () {} } } }) }))
      proxy = require('../../../api/proxy.js')
    })
  })
  afterEach(() => { jest.dontMock('axios'); delete process.env.GEMINI_API_KEY })

  it('forwards an allowed model', async () => {
    const r = await call(proxy, { model: 'gemini-3.5-flash-lite' })
    expect(r.status).toBe(200)
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][0]).toContain('/models/gemini-3.5-flash-lite:generateContent')
  })

  it('uses the first model when none is given', async () => {
    await call(proxy)
    expect(post.mock.calls[0][0]).toContain('/models/gemini-2.5-flash:generateContent')
  })

  it.each(['gemini-2.5-pro', 'gemini-2.0-flash', 'x/../../files', ''])('refuses model %j without calling Google', async (model) => {
    const r = await call(proxy, { model: encodeURIComponent(model) || 'nope' })
    expect(r.status).toBe(400)
    expect(post).not.toHaveBeenCalled()
  })

  it('allows 20 calls a minute per visitor, then answers 429', async () => {
    for (let i = 0; i < 20; i++) expect((await call(proxy, { ip: '9.9.9.9' })).status).toBe(200)
    expect((await call(proxy, { ip: '9.9.9.9' })).status).toBe(429)
    expect(post).toHaveBeenCalledTimes(20)
    // another visitor is unaffected
    expect((await call(proxy, { ip: '8.8.8.8' })).status).toBe(200)
  })
})

describe('the browser and the proxy agree on the models', () => {
  const read = (p) => fs.readFileSync(path.resolve(__dirname, '../../..', p), 'utf8')
  const models = (src, re) => [...src.match(re)[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  const client = models(read('components/gemini-client.js'), /const modelsToTry = \[([\s\S]*?)\]/)
  const proxy = models(read('api/proxy.js'), /const GEMINI_MODELS = \[([\s\S]*?)\]/)

  it('lists the same models in the same order', () => {
    expect(client).toEqual(proxy)
    expect(client.length).toBeGreaterThan(1)
  })

  it('lists no model Google has retired', () => {
    expect(client.filter((m) => /^gemini-(1\.|2\.0)/.test(m))).toEqual([])
  })
})
