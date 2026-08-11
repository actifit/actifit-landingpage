const fs = require('fs')
const path = require('path')

const locales = {
  ar: require('~/lang/ar_AE.js'),
  de: require('~/lang/de_DE.js'),
  en: require('~/lang/en_US.js'),
  es: require('~/lang/es_ES.js'),
  fr: require('~/lang/fr_FR.js'),
  hi: require('~/lang/hi_IN.js'),
  it: require('~/lang/it_IT.js'),
  ja: require('~/lang/ja_JP.js'),
  pl: require('~/lang/pl_PL.js'),
  pt: require('~/lang/pt_PT.js'),
  ru: require('~/lang/ru_RU.js'),
  tr: require('~/lang/tr_TR.js'),
  uk: require('~/lang/uk_UA.js'),
  zh: require('~/lang/zh_CN.js')
}

function extractTranslationKeys(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const keys = new Set()
  const pattern = /\$t\(\s*(['"`])([^'"`]+)\1\s*\)/g
  let match = pattern.exec(source)

  while (match) {
    keys.add(match[2])
    match = pattern.exec(source)
  }

  return keys
}

const sourceFiles = [
  path.resolve(__dirname, '../../../pages/market.vue'),
  path.resolve(__dirname, '../../../components/Product.vue')
]

const marketTranslationKeys = [...sourceFiles.flatMap(filePath => [...extractTranslationKeys(filePath)])]
const uniqueMarketTranslationKeys = [...new Set(marketTranslationKeys)]

describe('market translations', () => {
  it.each(Object.entries(locales))('%s provides every market label', (locale, messages) => {
    uniqueMarketTranslationKeys.forEach(key => {
      expect(typeof messages[key]).toBe('string')
      expect(messages[key].trim()).not.toBe('')
    })
  })
})
