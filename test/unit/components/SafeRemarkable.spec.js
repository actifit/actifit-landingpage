// Importing the plugin registers $sanitizePostHtml; stub what it pulls in on import.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import { shallowMount } from '@vue/test-utils'
import '@/plugins/vue-custom'
import SafeRemarkable from '@/components/SafeRemarkable.vue'

const render = (source) => {
  const wrapper = shallowMount(SafeRemarkable, {
    propsData: { source },
    mocks: { $t: (k) => k },
  })
  return wrapper.vm.$refs.remarkable
}

const handlerAttrs = (el) => Array.from(el.querySelectorAll('*'))
  .flatMap((n) => Array.from(n.attributes).map((a) => a.name))
  .filter((name) => /^on/i.test(name))

describe('SafeRemarkable', () => {
  beforeAll(() => { process.client = true })
  afterAll(() => { delete process.client })

  // Some callers pass text that never went through $cleanBody (a user's own posted
  // reply), and every caller's text is parsed again with html:true. Either way the
  // markup that reaches the page must be sanitized.
  it('drops event handlers and scripts from raw HTML in the source', () => {
    const el = render('hi <img src="x" onerror="alert(1)"> <script>alert(2)</script>')
    expect(handlerAttrs(el)).toEqual([])
    expect(el.querySelector('script')).toBeNull()
  })

  it('drops javascript: links built from raw HTML', () => {
    const el = render('<a href="javascript:alert(1)">x</a>')
    expect(el.innerHTML).not.toMatch(/javascript:/i)
  })

  it('drops iframes from hosts that are not allowed', () => {
    const el = render('<iframe src="https://evil.example/x"></iframe>')
    const frame = el.querySelector('iframe')
    expect(frame === null || !frame.getAttribute('src')).toBe(true)
  })

  it('still renders markdown, images, allowed embeds and links', () => {
    const el = render('**bold**\n\n<img src="https://images.hive.blog/0x0/a.png">\n\n' +
      '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>\n\n[site](https://example.com/page)')
    expect(el.querySelector('strong').textContent).toBe('bold')
    expect(el.querySelector('img').getAttribute('src')).toBe('https://images.hive.blog/0x0/a.png')
    expect(el.querySelector('iframe').getAttribute('src')).toBe('https://www.youtube.com/embed/abcdefghijk')
    const link = el.querySelector('a')
    // Off-site links keep the warning-modal hook that $cleanBody adds.
    expect(link.classList.contains('external-link')).toBe(true)
    expect(link.getAttribute('data-external-href')).toBe('https://example.com/page')
  })

  it('keeps the markup shape vue-remarkable produced', () => {
    const el = render('text')
    expect(el.tagName).toBe('DIV')
    expect(el.firstElementChild.tagName).toBe('SPAN')
  })

  it('renders nothing for an empty source', () => {
    expect(render('').textContent).toBe('')
  })
})
