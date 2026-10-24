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

  it('the widget script is LOADED by exactly one component', () => {
    // If a second entry point appears, disabling UserMenu's mount stops being enough.
    //
    // Matches an actual load, not a mention: UserMenu's rationale comment names the
    // script deliberately, and a bare substring search would flag that as a second
    // loader. Comment lines are stripped before checking.
    const stripComments = (src) => src
      .split('\n')
      .filter((l) => !/^\s*(\/\/|\*|<!--|\/\*)/.test(l))
      .join('\n')

    expect(source('components/StingChat.vue'))
      .toContain('https://chat.peakd.com/stwidget.js')

    const others = ['components/UserMenu.vue', 'layouts/default.vue', 'pages/login.vue']
    others.forEach((rel) => {
      expect(stripComments(source(rel))).not.toContain('stwidget.js')
    })
  })

  it('the signing gate is still present, for when chat returns', () => {
    // Disabling the mount is containment, not a fix. The gate must survive it, or
    // re-enabling later would quietly restore an ungated signer.
    const src = source('components/StingChat.vue')
    expect(src).toMatch(/export function isStingSignable/)
    expect(src).toContain('WIDGET_ORIGIN')
  })
})
