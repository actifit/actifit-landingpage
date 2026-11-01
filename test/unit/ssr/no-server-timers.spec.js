/**
 * created() (like beforeCreate() and serverPrefetch()) runs during server-side
 * rendering, but destroyed()/beforeDestroy() never do. A setInterval/setTimeout
 * started there on the server is never cleared and keeps the whole rendered app
 * alive: the wallet page leaked ~1 MB per render this way. Such timers must sit inside
 * an `if (process.client) { ... }` block, or live in mounted(), which only runs in
 * the browser.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '../../..')

function files (dir, exts) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...files(p, exts))
    else if (exts.some(x => e.name.endsWith(x))) out.push(p)
  }
  return out
}

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1')

// from the `{` at `open`, the text up to its matching `}`
function block (src, open) {
  let depth = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return src.slice(open + 1, i)
  }
  return ''
}

// bodies of every server-side hook: name() {, name: function () {, name: () => {
function serverHookBodies (src) {
  const re = /\b(?:async\s+)?(beforeCreate|created|serverPrefetch)\s*(?:\(\s*\)|:\s*(?:async\s+)?(?:function\s*\(\s*\)|\(\s*\)\s*=>))\s*\{/g
  const bodies = []
  let m
  while ((m = re.exec(src))) bodies.push(block(src, m.index + m[0].length - 1))
  return bodies
}

// the body with every `if (process.client) { ... }` block removed
function unguarded (body) {
  const re = /if\s*\(\s*process\.(client|browser)\s*\)\s*\{/g
  let out = body
  let m
  while ((m = re.exec(out))) {
    const inner = block(out, m.index + m[0].length - 1)
    out = out.slice(0, m.index) + out.slice(m.index + m[0].length + inner.length + 1)
    re.lastIndex = m.index
  }
  return out
}

describe('no timers left behind by server-side rendering', () => {
  const sources = [
    ...files(path.join(root, 'pages'), ['.vue']),
    ...files(path.join(root, 'components'), ['.vue']),
    ...files(path.join(root, 'layouts'), ['.vue']),
    ...files(path.join(root, 'mixins'), ['.js', '.vue']),
    ...files(path.join(root, 'plugins'), ['.js'])
  ]

  it('every setInterval/setTimeout in a server-side hook is inside an if (process.client) block', () => {
    const offenders = []
    for (const f of sources) {
      for (const body of serverHookBodies(stripComments(fs.readFileSync(f, 'utf8')))) {
        if (/\bset(Interval|Timeout)\s*\(/.test(unguarded(body))) offenders.push(path.relative(root, f))
      }
    }
    expect(offenders).toEqual([])
  })

  it('the checker flags an unguarded timer even when process.client appears elsewhere', () => {
    const src = 'created () { if (process.client) { a() } setInterval(f, 1) }'
    expect(/\bsetInterval\(/.test(unguarded(serverHookBodies(src)[0]))).toBe(true)
    const ok = 'created: () => { if (process.client) { this.t = setInterval(f, 1) } }'
    expect(/\bsetInterval\(/.test(unguarded(serverHookBodies(ok)[0]))).toBe(false)
  })

  it('the wallet refresh interval only starts in the browser', () => {
    const src = stripComments(fs.readFileSync(path.join(root, 'pages/_username/wallet.vue'), 'utf8'))
    const body = serverHookBodies(src).find(b => /runningInterval/.test(b))
    expect(body).toMatch(/if \(process\.client\) \{\s*this\.runningInterval = setInterval/)
  })
})
