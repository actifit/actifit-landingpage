// The server render of a post page carries the post's text, so crawlers, link previews
// and AI search read the post instead of a spinner. The audit of 2026-10-30 found 903
// characters on a post page: the body only ever loaded in the browser.
jest.mock('dsteem', () => ({ Client: jest.fn() }))
jest.mock('@hiveio/dhive', () => ({ Client: jest.fn() }))

import '@/plugins/vue-custom'
import fs from 'fs'
import path from 'path'
import { compile } from 'vue-template-compiler'
import hive from '@hiveio/hive-js'
import PostPage from '~/pages/_username/_permlink/index.vue'
import * as ssrPostBody from '~/utils/ssrPostBody'

const { renderPostBodyHtml } = ssrPostBody

const POST = {
  author: 'alice',
  permlink: 'my-walk',
  title: 'My Actifit Report Card',
  json_metadata: '{}',
  body: 'A long walk today.\n\n[off-site](https://example.com/x) and [peakd](https://peakd.com/@alice)\n\n' +
    '<script>alert(1)</script><img src="https://images.hive.blog/0x0/a.png" onerror="alert(1)">\n\n' +
    '[bad](javascript:alert(1))',
}

const onServer = async (fn) => {
  const prev = { server: process.server, client: process.client }
  process.server = true
  process.client = false
  try { return await fn() } finally { process.server = prev.server; process.client = prev.client }
}

const parse = (html) => {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

describe('renderPostBodyHtml on the server (sanitize-html path)', () => {
  it('renders the text and strips scripts and event handlers', async () => {
    const el = parse(await onServer(() => renderPostBodyHtml(POST.body)))
    expect(el.textContent).toContain('A long walk today.')
    expect(el.querySelector('script')).toBeNull()
    expect(el.innerHTML).not.toMatch(/onerror|alert\(1\)/)
    expect(el.querySelector('img')).not.toBeNull()
  })

  it('marks off-site links the way the browser does, without cheerio', async () => {
    const el = parse(await onServer(() => renderPostBodyHtml(POST.body)))
    const off = el.querySelector('a[href="https://example.com/x"]')
    expect(off.classList.contains('external-link')).toBe(true)
    expect(off.getAttribute('data-external-href')).toBe('https://example.com/x')
    expect(off.getAttribute('target')).toBe('_blank')
    const listed = el.querySelector('a[href="https://peakd.com/@alice"]')
    expect(listed.classList.contains('external-link')).toBe(false)
    expect(listed.getAttribute('target')).toBe('_blank')
  })

  it('never keeps a javascript: link, in href or data-external-href', async () => {
    const html = await onServer(() => renderPostBodyHtml('[bad](javascript:alert(1)) <a href="javascript:alert(2)">x</a>'))
    expect(html).not.toMatch(/javascript:/i)
  })

  it('keeps embeds on subdomains of trusted hosts and drops others', async () => {
    const html = await onServer(() => renderPostBodyHtml(
      '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe><iframe src="https://evil.example/x"></iframe>'))
    const frames = [...parse(html).querySelectorAll('iframe')].map((f) => f.getAttribute('src'))
    expect(frames).toContain('https://www.youtube.com/embed/abcdefghijk')
    expect(frames.join(' ')).not.toMatch(/evil/)
  })

  it('returns nothing for an empty body', () => {
    expect(renderPostBodyHtml('')).toBe('')
    expect(renderPostBodyHtml(undefined)).toBe('')
  })
})

describe('code highlighting is registered once', () => {
  it('a second evaluation of the plugin does not highlight code blocks twice', () => {
    // marked is one shared object; each extra marked.use() highlighted the previous
    // highlighter's output (a 24 MB page for one post with code blocks, in dev).
    const shared = jest.requireActual('marked')
    jest.isolateModules(() => {
      jest.doMock('marked', () => shared)
      require('@/plugins/vue-custom')
      require('@/plugins/vue-custom')
    })
    const html = shared.marked.parse('```js\nconst a = "<b>"\n```')
    expect(html).toContain('hljs')
    // a second pass would highlight the first pass's escaped markup
    expect(html).not.toMatch(/&lt;span class=/)
    expect(html).not.toMatch(/&amp;lt;/)
  })
})

describe('post page asyncData', () => {
  beforeEach(() => {
    jest.spyOn(hive.api, 'setOptions').mockImplementation(() => {})
    jest.spyOn(hive.api, 'getContentAsync').mockResolvedValue(POST)
  })
  afterEach(() => jest.restoreAllMocks())

  const run = (ssrContext) => PostPage.asyncData({ params: { username: '@alice', permlink: 'my-walk' }, app: {}, error: jest.fn(), ssrContext })

  it('server render: title and author in the data, the body HTML only on ssrContext', async () => {
    const ssrContext = {}
    const data = await onServer(() => run(ssrContext))
    expect(data.ssrArticle).toEqual({ title: 'My Actifit Report Card', author: 'alice' })
    expect(ssrContext.actifitPostHtml).toContain('A long walk today.')
    // not sent a second time in the page's data payload (desc is the 140-char meta snippet)
    expect(Object.keys(data).sort()).toEqual(['desc', 'pageTitle', 'ssrArticle'])
    expect(JSON.stringify(data)).not.toMatch(/<p>|<a /)
  })

  it('a body that fails to render leaves the page as before (no article, no error)', async () => {
    jest.spyOn(ssrPostBody, 'renderPostBodyHtml').mockImplementation(() => { throw new Error('boom') })
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const ssrContext = {}
    const data = await onServer(() => run(ssrContext))
    expect(data.ssrArticle).toBeUndefined()
    expect(ssrContext.actifitPostHtml).toBeUndefined()
    expect(data.pageTitle).toBe('My Actifit Report Card by @alice')
    spy.mockRestore()
  })

  it('client-side navigation renders nothing extra', async () => {
    const ssrContext = {}
    const data = await run(ssrContext)
    expect(data.ssrArticle).toBeUndefined()
    expect(ssrContext).toEqual({})
  })
})

describe('post page template', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../../pages/_username/_permlink/index.vue'), 'utf8')
  const template = src.slice(src.indexOf('<template>') + 10, src.lastIndexOf('</template>'))

  it('compiles', () => {
    expect(compile(template).errors).toEqual([])
  })

  it('shows the server article ahead of an error, so a failed browser load keeps the post', () => {
    const article = template.indexOf('v-else-if="ssrArticle"')
    const error = template.indexOf('v-else-if="errorDisplay"')
    expect(article).toBeGreaterThan(-1)
    expect(error).toBeGreaterThan(article)
  })

  it('never binds v-html to the body in the browser (hydration would replace the server HTML)', () => {
    // the browser branch is a bare <span>, which hydration leaves as the server sent it
    expect(template).toMatch(/<span v-if="ssrBodyHtml" v-html="ssrBodyHtml"><\/span>\s*<span v-else><\/span>/)
  })

  it('ssrBodyHtml is empty in the browser', () => {
    const vm = { $ssrContext: { actifitPostHtml: '<p>x</p>' } }
    const prev = process.server
    process.server = false
    try { expect(PostPage.computed.ssrBodyHtml.call(vm)).toBe('') } finally { process.server = prev }
  })
})
