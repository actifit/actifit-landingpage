import Layout from '~/layouts/default.vue'

// head() sets <html> dir/lang from the active locale (Trello #162).
const runHead = (i18n) => Layout.head.call({ $route: { path: '/' }, $i18n: i18n })

describe('layouts/default head() writing direction', () => {
  it('sets dir=rtl + lang for a RTL locale (Arabic)', () => {
    const h = runHead({ locale: 'ar', localeProperties: { dir: 'rtl' } })
    expect(h.htmlAttrs.dir).toBe('rtl')
    expect(h.htmlAttrs.lang).toBe('ar')
  })

  it('sets dir=ltr for a LTR locale', () => {
    const h = runHead({ locale: 'en', localeProperties: { dir: 'ltr' } })
    expect(h.htmlAttrs.dir).toBe('ltr')
    expect(h.htmlAttrs.lang).toBe('en')
  })

  it('defaults to ltr when the locale declares no direction', () => {
    const h = runHead({ locale: 'de', localeProperties: {} })
    expect(h.htmlAttrs.dir).toBe('ltr')
  })

  it('is safe when i18n is unavailable (SSR edge) — defaults dir=ltr, lang=en', () => {
    const h = Layout.head.call({ $route: { path: '/' } })
    expect(h.htmlAttrs.dir).toBe('ltr')
    expect(h.htmlAttrs.lang).toBe('en')
  })
})
