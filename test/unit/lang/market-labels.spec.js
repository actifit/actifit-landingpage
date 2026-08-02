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

describe('market translations', () => {
  it.each(Object.entries(locales))('%s provides the My Gadgets label', (locale, messages) => {
    expect(typeof messages.my_gadgets).toBe('string')
    expect(messages.my_gadgets.trim()).not.toBe('')
  })

  it.each(Object.entries(locales))('%s provides the Saved Products label', (locale, messages) => {
    expect(typeof messages.saved_products).toBe('string')
    expect(messages.saved_products.trim()).not.toBe('')
  })

  it.each(Object.entries(locales))('%s provides the purchase-currency label', (locale, messages) => {
    expect(typeof messages.purchase_currency).toBe('string')
    expect(messages.purchase_currency.trim()).not.toBe('')
  })

  it.each(Object.entries(locales))('%s provides the clear-filters label', (locale, messages) => {
    expect(typeof messages.clear_filters).toBe('string')
    expect(messages.clear_filters.trim()).not.toBe('')
  })
})
