/**
 * The Sting chat widget must stay OFF until its third-party script is vendored or pinned.
 *
 * components/StingChat.vue loads https://chat.peakd.com/stwidget.js into the actifit.io
 * origin with no SRI and no version pin, and hands that script the user's plaintext
 * posting key via setPostingKey. A compromise or malicious update of one CDN file
 * therefore reaches every posting-key user's key — and anything in our origin, including
 * anything that script loads, can read our localStorage.
 *
 * That single fact is why storing credentials in this origin is materially riskier for us
 * than for other Hive front ends, which do not run third-party code in theirs.
 *
 * This test exists so the widget cannot come back by accident — a stray revert or a merge
 * resolving the wrong way would otherwise reopen the exposure silently. Re-enabling is a
 * deliberate act that has to change this test too.
 */
import fs from 'fs'
import path from 'path'

const source = (rel) =>
  fs.readFileSync(path.resolve(__dirname, '../../../', rel), 'utf8')

describe('Sting chat is disabled', () => {
  it('UserMenu does not mount StingChat', () => {
    const src = source('components/UserMenu.vue')

    // The flag itself is off...
    expect(src).toMatch(/const\s+STING_CHAT_ENABLED\s*=\s*false/)

    // ...and the mount actually consults it. Without this half, flipping the constant
    // would be cosmetic and the widget would still render.
    const mount = src.match(/<li[^>]*>\s*<StingChat[\s\S]*?<\/li>/)
    expect(mount).not.toBeNull()
    const guard = src.match(/v-if="[^"]*"\s*>\s*<StingChat/)
    expect(guard).not.toBeNull()
    expect(guard[0]).toContain('stingChatEnabled')
  })

  it('no OTHER file in the app loads the widget script', () => {
    // If a second entry point exists, disabling UserMenu's mount is not enough.
    //
    // This used to check three hardcoded files - and so missed pages/stingtst.vue, a
    // public dev route that loaded stwidget.js into our origin on mount, with Keychain
    // passthrough on. A logged-in user sent to /stingtst would have run the third-party
    // script anyway, which is the exact exposure this change exists to remove. So scan
    // EVERYTHING under the app directories rather than a list someone has to maintain.
    //
    // Matches an actual load, not a mention: UserMenu's rationale comment names the
    // script deliberately. Comment lines are stripped before checking.
    const stripComments = (src) => src
      .split('\n')
      .filter((l) => !/^\s*(\/\/|\*|<!--|\/\*)/.test(l))
      .join('\n')

    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) return walk(full)
      return /\.(vue|js)$/.test(e.name) ? [full] : []
    })

    const root = path.resolve(__dirname, '../../../')
    const loaders = ['components', 'pages', 'layouts', 'plugins', 'mixins', 'store', 'middleware']
      .map((d) => path.join(root, d))
      .filter((d) => fs.existsSync(d))
      .flatMap(walk)
      .filter((f) => stripComments(fs.readFileSync(f, 'utf8')).includes('stwidget.js'))
      .map((f) => path.relative(root, f).replace(/\\/g, '/'))

    // StingChat.vue keeps the URL for when chat returns; nothing else may load it.
    expect(loaders).toEqual(['components/StingChat.vue'])
  })

  it('the signing gate is still present, for when chat returns', () => {
    // Disabling the mount is containment, not a fix. The gate must survive it, or
    // re-enabling later would quietly restore an ungated signer.
    const src = source('components/StingChat.vue')
    expect(src).toMatch(/export function isStingSignable/)
    expect(src).toContain('WIDGET_ORIGIN')
  })
})
