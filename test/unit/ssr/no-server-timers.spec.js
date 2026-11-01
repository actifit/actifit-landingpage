/**
 * created() runs during server-side rendering too, but destroyed()/beforeDestroy()
 * never do. A setInterval/setTimeout started in created() on the server is never
 * cleared and keeps the whole rendered app alive: the wallet page leaked ~1 MB per
 * render this way. Timers in created() must be guarded by process.client (or live
 * in mounted(), which only runs in the browser).
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '../../..')

function vueFiles (dir) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...vueFiles(p))
    else if (e.name.endsWith('.vue')) out.push(p)
  }
  return out
}

// the body of `created() { ... }` (or `created: function () { ... }`), by brace matching
function createdBody (src) {
  const m = /\bcreated\s*(?:\(\s*\)|:\s*(?:async\s+)?function\s*\(\s*\))\s*\{/.exec(src)
  if (!m) return null
  let depth = 0
  for (let i = m.index + m[0].length - 1; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return src.slice(m.index + m[0].length, i)
  }
  return null
}

describe('no timers left behind by server-side rendering', () => {
  const files = [...vueFiles(path.join(root, 'pages')), ...vueFiles(path.join(root, 'components')), ...vueFiles(path.join(root, 'layouts'))]

  it('every setInterval/setTimeout in created() is guarded by process.client', () => {
    const offenders = []
    for (const f of files) {
      const body = createdBody(fs.readFileSync(f, 'utf8'))
      if (!body || !/\bset(Interval|Timeout)\s*\(/.test(body)) continue
      if (!/process\.client|process\.browser|typeof window/.test(body)) offenders.push(path.relative(root, f))
    }
    expect(offenders).toEqual([])
  })

  it('the wallet refresh interval only starts in the browser', () => {
    const body = createdBody(fs.readFileSync(path.join(root, 'pages/_username/wallet.vue'), 'utf8'))
    expect(body).toMatch(/if \(process\.client\) \{\s*this\.runningInterval = setInterval/)
  })
})
