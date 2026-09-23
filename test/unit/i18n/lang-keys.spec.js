/**
 * i18n key-coverage guard (Trello #165, follow-up to the CI card #159).
 *
 * Scans every literal `$t('…')` / `$tc('…')` usage in pages/ and components/ and
 * asserts the key exists in the DEFAULT locale (lang/en_US.js). A key missing
 * from en_US renders as the raw key string to EVERY user (en is the
 * fallbackLocale, so a miss there is not masked by translation) — exactly the
 * class of bug that shipped `no_products_found`, `Products`, `None`, `quantity`
 * as raw text across all 14 locales.
 *
 * Scope notes:
 * - Enforced against ALL 14 locales: every used key must exist in en_US AND in
 *   each of the other 13 lang/*.js files, or the build fails. This prevents the
 *   translation drift that accumulated the wallet-key backlog (#167). A new key
 *   must therefore be added (translated) to every locale on the same PR.
 * - Only LITERAL keys are checked. Dynamic keys (`$t(someVar)`,
 *   `$t('prefix' + x)`) are intentionally skipped — the regex only accepts a
 *   single fully-quoted first argument terminated by `,` or `)`.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../../..')
const LANG_DIR = path.join(ROOT, 'lang')
const SCAN_DIRS = ['pages', 'components']
const DEFAULT_LOCALE = 'en_US.js'

const loadLocale = (file) => {
  const mod = require(path.join(LANG_DIR, file))
  return mod && mod.default ? mod.default : mod
}

// supports flat keys and the 8 nested groups (homepage.*, wallet.*, faq.*, …)
const hasKey = (obj, key) => {
  if (Object.prototype.hasOwnProperty.call(obj, key)) return true
  return key.split('.').reduce(
    (o, part) => (o && typeof o === 'object') ? o[part] : undefined,
    obj
  ) !== undefined
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const p = path.join(dir, entry.name)
  if (entry.isDirectory()) return walk(p)
  return (p.endsWith('.vue') || p.endsWith('.js')) ? [p] : []
})

// $t('key') / $tc("key") where the first arg is a complete quoted literal ending
// in `,` or `)`. Skips $t(var) and $t('a' + b) (no comma/paren right after quote).
const KEY_RE = /\$tc?\(\s*(['"])((?:\\.|(?!\1).)*?)\1\s*[,)]/g

const collectUsedKeys = () => {
  const used = new Map() // key -> Set(relative file paths)
  for (const dir of SCAN_DIRS) {
    const base = path.join(ROOT, dir)
    if (!fs.existsSync(base)) continue
    for (const file of walk(base)) {
      const src = fs.readFileSync(file, 'utf8')
      let m
      while ((m = KEY_RE.exec(src)) !== null) {
        const key = m[2]
        if (!key) continue
        if (!used.has(key)) used.set(key, new Set())
        used.get(key).add(path.relative(ROOT, file))
      }
    }
  }
  return used
}

describe('i18n key coverage', () => {
  const used = collectUsedKeys()
  const en = loadLocale(DEFAULT_LOCALE)

  it('scans a meaningful number of $t() keys (guards against a broken scanner)', () => {
    expect(used.size).toBeGreaterThan(500)
  })

  it('every $t() key used in pages/ + components/ exists in the default locale (en_US)', () => {
    const missing = [...used.entries()]
      .filter(([key]) => !hasKey(en, key))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, files]) => `  "${key}"  (e.g. ${[...files][0]})`)

    const report = missing.length
      ? `\n${missing.length} $t() key(s) missing from lang/en_US.js — they render as raw ` +
        `keys to all users. Add them to lang/en_US.js (and translate in the other locales):\n` +
        `${missing.join('\n')}\n`
      : ''

    expect(report).toBe('')
  })

  // Non-blocking visibility: list used keys missing from the other 13 locales so
  // the translation backlog is visible in CI logs without failing the build
  // (those gaps fall back to English at runtime).
  it('every $t() key used in pages/ + components/ exists in ALL locales (no translation drift)', () => {
    const localeFiles = fs.readdirSync(LANG_DIR).filter((f) => /^[a-z]{2}_[A-Z]{2}\.js$/.test(f) && f !== DEFAULT_LOCALE)
    const gaps = []
    for (const file of localeFiles) {
      const locale = loadLocale(file)
      const missing = [...used.keys()]
        .filter((k) => hasKey(en, k) && !hasKey(locale, k))
        .sort((a, b) => a.localeCompare(b))
      if (missing.length) gaps.push(`  ${file}: ${missing.length} missing — ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ', …' : ''}`)
    }

    const report = gaps.length
      ? `\nUsed $t() key(s) missing from these locale file(s). Every used key must exist in all 14 ` +
        `lang/*.js files — add (translate) the missing keys so translations don't drift:\n${gaps.join('\n')}\n`
      : ''

    expect(report).toBe('')
  })
})
