/**
 * Behavioural: run the REAL proxy against a local upstream that misbehaves, and prove the
 * login route fails fast and fails correctly.
 *
 * Why this exists: the first version of this change was guarded only by source-text
 * regexes, and a review proved they were decorative - every one still passed with every
 * timeout set to 0, which axios treats as "no timeout at all". A regex cannot see a value
 * of 0. A hung upstream can.
 *
 * Adapted from the reviewer's test. The repo's jest setup uses jsdom, which provides
 * XMLHttpRequest, and axios would then pick its BROWSER adapter - so it is removed here
 * so axios uses the Node http adapter, as it does in production.
 */
const http = require('http')
delete global.XMLHttpRequest
delete window.XMLHttpRequest

const listen = (srv) => new Promise((resolve) => srv.listen(0, '127.0.0.1', () => resolve(srv.address().port)))

function startUpstream (mode) {
  const sockets = new Set()
  const srv = http.createServer((req, res) => {
    if (mode === 'hang') return // accept the connection, never answer
    if (mode === 'stall-after-headers') {
      // headers and a fragment of body, then silence - the case that used to come back
      // to the browser as a 200 with an empty body
      res.writeHead(200, { 'content-type': 'application/json' })
      res.write('{"success":')
    }
  })
  srv.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)) })
  return { srv, close: () => { sockets.forEach((s) => s.destroy()); srv.close() } }
}

async function callLogin (mode) {
  let up = null
  let upstreamUrl
  if (mode === 'refused') {
    // a port nothing is listening on
    const probe = http.createServer()
    const freePort = await listen(probe)
    await new Promise((resolve) => probe.close(resolve))
    upstreamUrl = 'http://127.0.0.1:' + freePort
  } else {
    up = startUpstream(mode)
    upstreamUrl = 'http://127.0.0.1:' + await listen(up.srv)
  }
  process.env.ACTI_API_URL = upstreamUrl

  let proxy
  jest.isolateModules(() => { proxy = require('../../../api/proxy.js') })
  const front = http.createServer((req, res) => proxy(req, res, () => {}))
  const port = await listen(front)
  const t0 = Date.now()
  try {
    return await new Promise((resolve, reject) => {
      const body = JSON.stringify({ username: 'alice' })
      const req = http.request({
        port, path: '/loginChallenge', method: 'POST',
        headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }
      }, (res) => {
        let d = ''
        res.on('data', (c) => { d += c })
        res.on('end', () => resolve({ status: res.statusCode, body: d, ms: Date.now() - t0 }))
      })
      req.on('error', reject)
      // stands in for the browser's own 20s abort
      req.setTimeout(19000, () => { req.destroy(); resolve({ status: 'client-abort', ms: Date.now() - t0 }) })
      req.end(body)
    })
  } finally {
    front.close()
    if (up) up.close()
  }
}

jest.setTimeout(25000)

describe('proxy login route against a misbehaving upstream', () => {
  test('a hung upstream gets a 503 before the client\'s 20s abort', async () => {
    const r = await callLogin('hang')
    expect(r.status).toBe(503)
    // leaves headroom for Cloudflare and the browser round trip
    expect(r.ms).toBeLessThan(18000)
  })

  test('an upstream that stalls after its headers is NOT reported as success', async () => {
    // It used to answer 200 with an empty body, which the login client turned into
    // "your account and/or private posting key is incorrect".
    const r = await callLogin('stall-after-headers')
    expect(r.status).toBe(503)
    expect(r.ms).toBeLessThan(18000)
  })

  test('a refused connection is a 503, and leaks no internals', async () => {
    const r = await callLogin('refused')
    expect(r.status).toBe(503)
    // it used to echo error.message, e.g. "connect ECONNREFUSED 127.0.0.1:3120"
    expect(r.body).not.toMatch(/ECONNREFUSED|127\.0\.0\.1|:\d{4,5}/)
  })
})
