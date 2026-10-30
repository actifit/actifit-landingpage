// Importing the plugin registers $sanitizePostHtml; stub what it pulls in on import.
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))
jest.mock('@hiveio/hive-js', () => ({ broadcast: { send: jest.fn() }, memo: { decode: jest.fn() } }))
jest.mock('@/utils/keyPrompt', () => ({ requestKey: jest.fn() }))

import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import { Remarkable } from 'remarkable'
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

  // The main regression risk: post bodies already went through $cleanBody, and the
  // second sanitize must not change them.
  it('leaves $cleanBody output unchanged', () => {
    const md = new Remarkable({ html: true, breaks: true, typographer: true })
    const body = [
      '# Title', '**bold** and @alice', '![](https://images.hive.blog/0x0/a.png)',
      'https://www.youtube.com/watch?v=abcdefghijk', '<details><summary>more</summary>text</details>',
      '| a | b |\n|---|---|\n| 1 | 2 |', '```js\nconst x = 1\n```',
      '<div class="pull-left" style="text-align:center">c</div>',
    ].join('\n\n')
    const cleaned = Vue.prototype.$cleanBody(body, false, false)
    // Parse it as the old innerHTML insert did, so both sides get the same DOM fix-ups.
    const before = document.createElement('span')
    before.innerHTML = md.render(cleaned.trim())
    expect(render(cleaned).firstElementChild.innerHTML).toBe(before.innerHTML)
  })

  it('does not render again when the parent re-renders with equal options', async () => {
    const spy = jest.spyOn(Vue.prototype, '$sanitizePostHtml')
    const Parent = {
      components: { SafeRemarkable },
      data: () => ({ tick: 0 }),
      template: '<div>{{ tick }}<SafeRemarkable source="**x**" :options="{ html: true, breaks: true }" /></div>',
    }
    const wrapper = shallowMount(Parent, { stubs: { SafeRemarkable }, mocks: { $t: (k) => k } })
    const calls = spy.mock.calls.length
    for (let i = 1; i <= 3; i++) { wrapper.vm.tick = i; await wrapper.vm.$nextTick() }
    expect(spy.mock.calls.length).toBe(calls)
    spy.mockRestore()
  })
})
