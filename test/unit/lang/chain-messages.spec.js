// Shown when a typed-key user acts with Blurt selected. Actifit does not officially
// support Steem, and Hive Keychain cannot sign Blurt, so the message must name neither.
const fs = require('fs')
const path = require('path')

const langDir = path.join(__dirname, '../../../lang')
const locales = fs.readdirSync(langDir)
  .filter((f) => /^[a-z]{2}_[A-Z]{2}\.js$/.test(f))
  .map((f) => [f.replace('.js', ''), require(path.join(langDir, f))])

describe('typed_key_hive_only', () => {
  it('covers every locale', () => {
    expect(locales.length).toBe(14)
  })

  test.each(locales)('%s names Hive and neither Steem nor Keychain', (_, messages) => {
    const msg = messages.typed_key_hive_only
    expect(typeof msg).toBe('string')
    expect(msg).toContain('Hive')
    expect(msg).not.toMatch(/steem|keychain/i)
  })
})
