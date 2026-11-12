// The server render of a post page carries the post's text, so crawlers, link previews
// and AI search read the post instead of a spinner. The audit of 2026-10-30 found 903
// characters on a post page: the body only ever loaded in the browser.
jest.mock('dsteem', () => ({ Client: jest.fn() }))
jest.mock('@hiveio/dhive', () => ({ Client: jest.fn() }))

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
  body: '## Morning\n\nA **long** walk today.\n\n![photo](https://images.hive.blog/a.png)\n\n' +
    'Read [my plan](https://peakd.com/@alice/plan) and https://example.com/x too.\n\n' +
    '<script>alert(1)</script><img src="x" onerror="alert(1)">Tom & "Jerry" <3',
}

const onServer = async (fn) => {
  const prev = { server: process.server, client: process.client }
  process.server = true
  process.client = false
  try { return await fn() } finally { process.server = prev.server; process.client = prev.client }
}

describe('renderPostBodyHtml', () => {
  const html = renderPostBodyHtml(POST.body)
  const el = document.createElement('div')
  el.innerHTML = html

  it('keeps the text as paragraphs, without markdown markup', () => {
    const paras = [...el.querySelectorAll('p')].map((p) => p.textContent)
    expect(paras[0]).toBe('Morning')
    expect(paras[1]).toBe('A long walk today.')
    expect(paras.join(' ')).toContain('Read my plan and too.')
  })

  it('leaves out script and style contents, and does not double-escape entities', () => {
    const out = renderPostBodyHtml('<style>p{color:red}</style><script>var x = 1</script>Fish &amp; chips &lt;3 "quoted"')
    expect(out).toBe('<p>Fish &amp; chips &lt;3 &quot;quoted&quot;</p>')
  })

  it('drops images and URLs', () => {
    expect(html).not.toMatch(/images\.hive\.blog|example\.com|peakd\.com|photo/)
  })

  it('outputs only <p> elements and escaped text', () => {
    expect([...el.querySelectorAll('*')].every((n) => n.tagName === 'P')).toBe(true)
    expect(html).not.toMatch(/<(?!\/?p>)/)
    expect(el.textContent).toContain('Tom & "Jerry"')
  })

  it('returns nothing for a body with no text', () => {
    expect(renderPostBodyHtml('')).toBe('')
    expect(renderPostBodyHtml(undefined)).toBe('')
    expect(renderPostBodyHtml('![x](https://a.b/c.png)\n\nhttps://a.b/c')).toBe('')
  })

  it('caps the text', () => {
    expect(renderPostBodyHtml('word '.repeat(20000)).length).toBeLessThan(21000)
  })

  // The browser's pipeline took 7-15 s on crafted 16 KB bodies (review of PR #536); on
  // the server's single thread that stops the whole site. These are Hive's maximum size.
  it.each([
    ['<img src="'], ['*a_'], ['['], ['<'], ['!['], ['](' ], ['http://'], ['\n \n'], ['# '], ['[x](http://a.b/'],
  ])('a 64 KB body of %j renders quickly', (unit) => {
    const body = unit.repeat(Math.ceil(65536 / unit.length)).slice(0, 65536)
    const t = Date.now()
    renderPostBodyHtml(body)
    expect(Date.now() - t).toBeLessThan(500)
  })
})

describe('post page asyncData', () => {
  let getContent
  beforeEach(() => {
    jest.spyOn(hive.api, 'setOptions').mockImplementation(() => {})
    getContent = jest.spyOn(hive.api, 'getContentAsync').mockResolvedValue(POST)
  })
  afterEach(() => jest.restoreAllMocks())

  const run = (ssrContext) => PostPage.asyncData({ params: { username: '@alice', permlink: 'my-walk' }, app: {}, error: jest.fn(), ssrContext })

  it('server render: title and author in the data, the body HTML only on ssrContext', async () => {
    const ssrContext = {}
    const data = await onServer(() => run(ssrContext))
    expect(data.ssrArticle).toEqual({ title: 'My Actifit Report Card', author: 'alice' })
    expect(ssrContext.actifitPostHtml).toContain('<p>A long walk today.</p>')
    // not sent a second time in the page's data payload (desc is the 140-char meta snippet)
    expect(Object.keys(data).sort()).toEqual(['desc', 'pageTitle', 'ssrArticle'])
    expect(JSON.stringify(data)).not.toMatch(/<p>/)
  })

  it('a post with no text gets no article', async () => {
    getContent.mockResolvedValue(Object.assign({}, POST, { body: '![x](https://images.hive.blog/a.png)' }))
    const ssrContext = {}
    const data = await onServer(() => run(ssrContext))
    expect(data.ssrArticle).toBeUndefined()
    expect(ssrContext.actifitPostHtml).toBeUndefined()
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

  it('the meta description reads only the start of a long body', async () => {
    // 64 KB of steemitimages URLs took ~0.6 s in the description regexes
    getContent.mockResolvedValue(Object.assign({}, POST, { body: 'https://steemitimages.com/a'.repeat(2500) }))
    const t = Date.now()
    await onServer(() => run({}))
    expect(Date.now() - t).toBeLessThan(500) // was ~600 ms; ~5 ms now
  })
})

describe('after the browser loads the post', () => {
  afterEach(() => jest.restoreAllMocks())

  const loadWith = async (fetchSupplementaryData) => {
    jest.spyOn(hive.api, 'setOptions').mockImplementation(() => {})
    jest.spyOn(hive.api, 'getContentAsync').mockResolvedValue(POST)
    const vm = {
      ssrArticle: { title: 't', author: 'alice' },
      $route: { params: { username: '@alice', permlink: 'my-walk' } },
      resetData () {}, alignSidebar () {}, fetchReportCommentData () {},
      fetchSupplementaryData,
    }
    await PostPage.methods.fetchPageData.call(vm)
    return vm
  }

  it('the server article is dropped, so a later reload shows the spinner, not a stale title', async () => {
    const vm = await loadWith(async () => {})
    expect(vm.report).toBe(POST)
    expect(vm.ssrArticle).toBeNull()
  })

  // The full page (with the sidebar) used to wait for three author lookups, leaving the
  // plain-text server version up for seconds.
  it('the full post shows without waiting for the author details', async () => {
    const vm = await loadWith(() => new Promise(() => {}))
    expect(vm.isLoading).toBe(false)
    expect(vm.report).toBe(POST)
    expect(vm.ssrArticle).toBeNull()
  })

  it('the sidebar fills from Hive even when the Actifit API fails', async () => {
    jest.spyOn(hive.api, 'getAccountsAsync').mockResolvedValue([{ name: 'alice', balance: '1.000 HIVE' }])
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
    const prevFetch = global.fetch
    global.fetch = jest.fn(() => Promise.reject(new Error('api down')))
    try {
      const vm = { report: POST, cur_bchain: 'HIVE', authorAccountInfo: null, authorAfitBalance: null, userRank: null }
      await PostPage.methods.fetchSupplementaryData.call(vm) // never rejects
      expect(vm.authorAccountInfo).toEqual({ name: 'alice', balance: '1.000 HIVE' })
      expect(vm.authorAfitBalance).toBeNull()
      expect(vm.userRank).toBeNull()
      expect(errors).toHaveBeenCalled()
    } finally { global.fetch = prevFetch }
  })

  it('a failed first load keeps the server article', async () => {
    jest.spyOn(hive.api, 'setOptions').mockImplementation(() => {})
    jest.spyOn(hive.api, 'getContentAsync').mockRejectedValue(new Error('down'))
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const article = { title: 't', author: 'alice' }
    const vm = {
      ssrArticle: article,
      $route: { params: { username: '@alice', permlink: 'my-walk' } },
      resetData () {}, alignSidebar () {},
    }
    await PostPage.methods.fetchPageData.call(vm)
    expect(vm.ssrArticle).toBe(article)
    expect(vm.errorDisplay).toBeTruthy()
  })
})

describe('post page template', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../../pages/_username/_permlink/index.vue'), 'utf8')
  const template = src.slice(src.indexOf('<template>') + 10, src.lastIndexOf('</template>'))

  it('compiles', () => {
    expect(compile(template).errors).toEqual([])
  })

  it('shows the server article ahead of an error, so a failed first load keeps the post', () => {
    const article = template.indexOf('v-else-if="ssrArticle"')
    const error = template.indexOf('v-else-if="errorDisplay"')
    expect(article).toBeGreaterThan(-1)
    expect(error).toBeGreaterThan(article)
  })

  it('the server article keeps the sidebar column, so the text does not jump across', () => {
    const start = template.indexOf('v-else-if="ssrArticle"')
    const block = template.slice(start, template.indexOf('v-else-if="errorDisplay"'))
    expect(block).toMatch(/<UserSidebar :report="\{ author: ssrArticle\.author \}"/)
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
