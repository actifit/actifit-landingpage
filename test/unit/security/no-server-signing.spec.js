/**
 * No application code may send a transaction to the server to be signed.
 *
 * /performTrx, /performTrxPost and /memoDecode made the SERVER sign with - or decrypt
 * using - a key it had stored for the user. That is what the 2026-10-21 incident abused:
 * stored posting keys signed Hive-Engine drains server-side. All three are permanently
 * disabled, and the server no longer holds any user key.
 *
 * Every signing path now runs in the browser ($broadcastWithKey in plugins/vue-custom.js)
 * or in the user's wallet (Keychain, HiveAuth). This test keeps it that way: a revived
 * call - a stale branch merged, a copy-pasted block from old code - fails here rather
 * than shipping a dead button, or worse, a reason to bring server-side signing back.
 *
 * It scans every app source directory rather than a list of files, because a hardcoded
 * list is exactly how an earlier guard here missed a file.
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../../../')
const DIRS = ['components', 'pages', 'layouts', 'plugins', 'mixins', 'store', 'middleware', 'utils']
const RETIRED = ['performTrx', 'performTrxPost', 'memoDecode']

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name)
  if (e.isDirectory()) return walk(full)
  return /\.(vue|js)$/.test(e.name) ? [full] : []
})

// Comments may legitimately name the retired routes - explaining why they are gone.
// Only a reference in executable code counts.
const codeOnly = (src) => src
  .split('\n')
  .filter((l) => !/^\s*(\/\/|\*|\/\*|<!--)/.test(l))
  .map((l) => l.replace(/\s\/\/.*$/, ''))
  .join('\n')

const sources = DIRS
  .map((d) => path.join(ROOT, d))
  .filter((d) => fs.existsSync(d))
  .flatMap(walk)

describe('no server-side signing', () => {
  RETIRED.forEach((route) => {
    it('no app code calls /' + route, () => {
      const hits = sources
        .filter((f) => new RegExp("['\"/`]" + route + "\\b").test(codeOnly(fs.readFileSync(f, 'utf8'))))
        .map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
      expect(hits).toEqual([])
    })
  })

  it('the scan actually covers the files that used to call it', () => {
    // Guard the guard: if the walk silently matched nothing, every assertion above would
    // pass vacuously.
    const rel = sources.map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
    expect(rel).toEqual(expect.arrayContaining([
      'plugins/vue-custom.js',
      'components/VoteModal.vue',
      'components/Comments.vue',
      'components/PostModal.vue',
      'pages/_username/wallet.vue'
    ]))
  })
})
