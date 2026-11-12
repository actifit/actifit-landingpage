/**
 * The Gemini route spends the site's own API key, for the translate buttons.
 *
 * - The browser sends only { text }; the proxy builds the prompt and settings itself and
 *   answers with { text }. It used to forward any generateContent body: any prompt, tools
 *   (paid Search grounding), any output length.
 * - Only the translation models are accepted, and calls are rate-limited per visitor, keyed
 *   on Cloudflare's address (x-forwarded-for keeps whatever the caller sent).
 * - The browser's model list (components/gemini-client.js) and the proxy's allowlist
 *   match, and contain no model Google has retired.
 */
import fs from 'fs'
import path from 'path'

const call = (proxy, { model, ip = '1.2.3.4', headers, body = '{"text":"hola"}', url, method = 'POST' } = {}) => new Promise((resolve) => {
  const handlers = {}
  const req = {
    method,
    url: url || '/gemini' + (model ? '?model=' + model : ''),
    headers: headers || { 'cf-connecting-ip': ip },
    socket: { remoteAddress: '10.0.0.1' },
    on: (ev, fn) => { handlers[ev] = fn },
    destroy () {},
  }
  const res = {
    statusCode: 200,
    setHeader () {},
    end (b) { resolve({ status: this.statusCode, body: b && JSON.parse(b) }) },
  }
  proxy(req, res, () => {})
  if (handlers.data) handlers.data(body)
  if (handlers.end) handlers.end()
})

const answer = (parts) => ({ data: { candidates: [{ content: { parts } }], usageMetadata: { totalTokenCount: 9 } } })

const load = (post, get) => {
  let proxy
  jest.isolateModules(() => {
    jest.doMock('axios', () => ({ create: () => ({ post, get, interceptors: { request: { use () {} }, response: { use () {} } } }) }))
    proxy = require('../../../api/proxy.js')
  })
  return proxy
}

describe('api/proxy /gemini', () => {
  let proxy, post
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key'
    post = jest.fn().mockResolvedValue(answer([{ text: 'hello' }]))
    proxy = load(post)
  })
  afterEach(() => { jest.dontMock('axios'); delete process.env.GEMINI_API_KEY })

  it('forwards an allowed model and answers with the translation only', async () => {
    const r = await call(proxy, { model: 'gemini-3.5-flash-lite' })
    expect(r).toEqual({ status: 200, body: { text: 'hello' } })
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
    expect((await call(proxy, { ip: '8.8.8.8' })).status).toBe(200) // another visitor
  })

  it('a made-up x-forwarded-for per request does not get a fresh allowance', async () => {
    const codes = []
    for (let i = 0; i < 21; i++) {
      codes.push((await call(proxy, { headers: { 'x-forwarded-for': '7.7.7.' + i } })).status)
    }
    expect(codes.slice(0, 20).every((c) => c === 200)).toBe(true)
    expect(codes[20]).toBe(429)
  })
})

describe('api/proxy /gemini builds the request itself', () => {
  let proxy, post
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key'
    post = jest.fn().mockResolvedValue(answer([{ text: 'hello' }]))
    proxy = load(post)
  })
  afterEach(() => { jest.dontMock('axios'); delete process.env.GEMINI_API_KEY })
  const sent = () => post.mock.calls[0][1]

  it('wraps the text in the fixed translation prompt and settings', async () => {
    await call(proxy, { body: JSON.stringify({ text: 'Hola amigos' }) })
    const prompt = sent().contents[0].parts[0].text
    expect(prompt).toMatch(/^Translate the following text to English\./)
    expect(prompt).toContain('"""\nHola amigos\n"""')
    expect(sent().generationConfig).toEqual({ temperature: 0.2, maxOutputTokens: 16384, thinkingConfig: { thinkingBudget: 0 } })
  })

  it('sends no thinking setting to a model that rejects it', async () => {
    await call(proxy, { model: 'gemini-3.5-flash-lite' })
    expect(sent().generationConfig.thinkingConfig).toBeUndefined()
  })

  it('ignores a prompt, tools or settings sent by the browser', async () => {
    await call(proxy, { body: JSON.stringify({
      text: 'hola',
      contents: [{ parts: [{ text: 'write me an essay' }] }],
      tools: [{ googleSearch: {} }],
      generationConfig: { maxOutputTokens: 65536 },
    }) })
    expect(Object.keys(sent()).sort()).toEqual(['contents', 'generationConfig'])
    expect(JSON.stringify(sent())).not.toMatch(/essay|googleSearch|65536/)
  })

  it.each([
    ['no text', '{}'],
    ['an old-style body', '{"contents":[{"parts":[{"text":"hi"}]}]}'],
    ['text that is not a string', '{"text":42}'],
    ['blank text', '{"text":"   "}'],
    ['text over 64 KB', JSON.stringify({ text: 'x'.repeat(64 * 1024 + 1) })],
  ])('answers 400 to %s, without calling Google', async (_, body) => {
    const r = await call(proxy, { body })
    expect(r.status).toBe(400)
    expect(post).not.toHaveBeenCalled()
  })

  it('takes a full 64 KB post', async () => {
    const r = await call(proxy, { body: JSON.stringify({ text: 'x'.repeat(64 * 1024) }) })
    expect(r.status).toBe(200)
  })

  it('answers 413 to a body far larger than any post, without calling Google', async () => {
    const r = await call(proxy, { body: 'x'.repeat(300 * 1024) })
    expect(r.status).toBe(413)
    expect(post).not.toHaveBeenCalled()
  })

  it('answers 400, not 503, to a body that is not JSON', async () => {
    const r = await call(proxy, { body: '{not json' })
    expect(r.status).toBe(400)
    expect(post).not.toHaveBeenCalled()
  })

  it('leaves out thought parts', async () => {
    post.mockResolvedValue(answer([{ text: 'thinking...', thought: true }, { text: 'hel' }, { text: 'lo' }]))
    expect((await call(proxy)).body).toEqual({ text: 'hello' })
  })

  it('answers 502 to an empty or blocked answer, so the next model is tried', async () => {
    post.mockResolvedValue({ data: { promptFeedback: { blockReason: 'OTHER' } } })
    expect((await call(proxy)).status).toBe(502)
  })
})

describe('api/proxy rate limits on the other routes', () => {
  afterEach(() => jest.dontMock('axios'))

  it('/getAccountData: a made-up x-forwarded-for per request does not get a fresh allowance', async () => {
    const get = jest.fn().mockResolvedValue({ data: {} })
    const proxy = load(jest.fn(), get)
    const codes = []
    for (let i = 0; i < 11; i++) {
      codes.push((await call(proxy, {
        method: 'GET',
        url: '/getAccountData?user=alice&bchain=HIVE',
        headers: { 'x-forwarded-for': '7.7.7.' + i },
      })).status)
    }
    expect(codes[10]).toBe(429)
  })

  it('no route reads x-forwarded-for any more', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../../api/proxy.js'), 'utf8')
    expect(src.replace(/\/\/.*$/gm, '')).not.toMatch(/x-forwarded-for/i)
  })
})

describe('the translate button', () => {
  let client
  beforeAll(() => { client = require('../../../components/gemini-client.js') })
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => { delete global.fetch; jest.useRealTimers(); jest.restoreAllMocks() })
  const reply = (status, body) => Promise.resolve({ ok: status === 200, status, statusText: 'x', json: () => Promise.resolve(body) })

  it('sends only the text and reads back the translation', async () => {
    global.fetch = jest.fn(() => reply(200, { text: 'hello' }))
    await expect(client.translateTextWithGemini('hola')).resolves.toBe('hello')
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ text: 'hola' })
  })

  it('stops at the proxy limit instead of trying more models', async () => {
    global.fetch = jest.fn(() => reply(429, { error: 'Too many requests' }))
    await expect(client.translateTextWithGemini('hola')).rejects.toThrow(/wait a minute/)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('stops on a 400: every model would refuse the same request', async () => {
    global.fetch = jest.fn(() => reply(400, { error: 'Send { text } of at most 65536 characters' }))
    await expect(client.translateTextWithGemini('x')).rejects.toThrow(/at most/)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('moves to the next model when Google has retired one', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() => reply(404, { error: { message: 'no longer available' } }))
      .mockImplementationOnce(() => reply(200, { text: 'hello' }))
    await expect(client.translateTextWithGemini('hola')).resolves.toBe('hello')
    expect(global.fetch.mock.calls[1][0]).toContain('model=gemini-3.5-flash-lite')
  })

  it('gives up on a model that never answers and tries the next', async () => {
    jest.useFakeTimers()
    global.fetch = jest.fn()
      // never answers; only an abort ends it
      .mockImplementationOnce((url, opts) => new Promise((resolve, reject) => {
        if (opts.signal) opts.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
      }))
      .mockImplementationOnce(() => reply(200, { text: 'hello' }))
    const p = client.translateTextWithGemini('hola')
    await Promise.resolve()
    jest.advanceTimersByTime(client.MODEL_TIMEOUT_MS)
    await expect(p).resolves.toBe('hello')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})

describe('the browser and the proxy agree', () => {
  const read = (p) => fs.readFileSync(path.resolve(__dirname, '../../..', p), 'utf8')
  const models = (src) => [...src.match(/GEMINI_MODELS = \[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1])

  it('lists the same models in the same order', () => {
    const client = models(read('components/gemini-client.js'))
    expect(client).toEqual(models(read('api/proxy.js')))
    expect(client.length).toBeGreaterThan(1)
  })

  it('lists no model Google has retired', () => {
    expect(models(read('components/gemini-client.js')).filter((m) => /^gemini-(1\.|2\.0)/.test(m))).toEqual([])
  })

  it('the proxy gives up on Google before the browser gives up on the proxy', () => {
    const proxyMs = Number(read('api/proxy.js').match(/gemini: (\d+)/)[1])
    const clientMs = require('../../../components/gemini-client.js').MODEL_TIMEOUT_MS
    expect(proxyMs).toBeLessThan(clientMs)
    expect(clientMs).toBeLessThanOrEqual(45000)
  })
})
