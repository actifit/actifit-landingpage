import sanitizePlugin from '@/plugins/sanitize'

// The server render runs on Node 16 (.nvmrc). sanitize-html 2.17.6 pulled in an
// ESM-only htmlparser2 that Node 16 cannot require, so every server render of a page
// heading threw and the page answered 500. CI runs on the same Node, so loading the
// real module here catches that again if the dependency moves.
describe('plugins/sanitize on the server (sanitize-html path)', () => {
  let sanitize
  beforeAll(() => {
    process.client = false
    sanitizePlugin({ app: {} }, (name, fn) => { if (name === 'sanitize') sanitize = fn })
  })
  afterAll(() => { delete process.client })

  it('loads sanitize-html on this Node version', () => {
    expect(typeof require('sanitize-html')).toBe('function')
  })

  it('renders a heading with a chain logo', () => {
    expect(sanitize('Explore <img class="mr-2 token-logo-md" src="/img/HIVE.png">'))
      .toBe('Explore <img class="mr-2 token-logo-md" src="/img/HIVE.png" />')
  })

  it('strips scripts and event handlers', () => {
    const out = sanitize('<b>x</b><script>alert(1)</script><img src="/img/a.png" onerror="alert(1)">')
    expect(out).not.toMatch(/script|onerror/i)
    expect(out).toContain('<b>x</b>')
  })
})
