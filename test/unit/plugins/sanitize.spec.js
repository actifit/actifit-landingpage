import sanitizePlugin from '@/plugins/sanitize'

// The plugin is a Nuxt inject() factory. This helper runs it and collects the
// injected helpers ($sanitize, $safeUrl) so we can exercise them directly.
function loadInjected () {
  const injected = {}
  sanitizePlugin({ app: {} }, (name, fn) => { injected[name] = fn })
  return injected
}

describe('plugins/sanitize', () => {
  describe('$sanitize (client / DOMPurify path)', () => {
    let sanitize
    beforeAll(() => {
      // process.client steers the plugin to the browser DOMPurify branch
      process.client = true
      sanitize = loadInjected().sanitize
    })
    afterAll(() => { delete process.client })

    it('keeps allowed formatting tags', () => {
      const out = sanitize('<p>hello <strong>world</strong></p>')
      expect(out).toContain('<strong>world</strong>')
    })

    it('strips <script> tags', () => {
      const out = sanitize('<p>ok</p><script>alert(1)</script>')
      expect(out).not.toMatch(/<script/i)
      expect(out).toContain('ok')
    })

    it('removes inline event handlers (onerror/onclick)', () => {
      const out = sanitize('<img src="x" onerror="alert(1)">')
      expect(out.toLowerCase()).not.toContain('onerror')
    })

    it('drops disallowed tags like <iframe>', () => {
      const out = sanitize('<iframe src="https://evil.test"></iframe>')
      expect(out.toLowerCase()).not.toContain('<iframe')
    })

    it('neutralizes javascript: hrefs', () => {
      const out = sanitize('<a href="javascript:alert(1)">x</a>')
      expect(out.toLowerCase()).not.toContain('javascript:')
    })
  })

  describe('$safeUrl', () => {
    let safeUrl
    beforeAll(() => { safeUrl = loadInjected().safeUrl })

    it('allows http/https URLs unchanged', () => {
      expect(safeUrl('https://actifit.io/x')).toBe('https://actifit.io/x')
      expect(safeUrl('http://example.com')).toBe('http://example.com')
    })

    it('allows contact schemes but not wallet-signing schemes', () => {
      expect(safeUrl('hive:alice')).toBe('#')
      expect(safeUrl('hive://sign/op/x')).toBe('#')
      expect(safeUrl('hivesigner:x')).toBe('#')
      expect(safeUrl('mailto:a@b.com')).toBe('mailto:a@b.com')
      expect(safeUrl('tel:+123')).toBe('tel:+123')
    })

    it('passes through relative and anchor links', () => {
      expect(safeUrl('/profile')).toBe('/profile')
      expect(safeUrl('#section')).toBe('#section')
    })

    it('blocks javascript: scheme (returns #)', () => {
      expect(safeUrl('javascript:alert(1)')).toBe('#')
      expect(safeUrl('JavaScript:alert(1)')).toBe('#')
    })

    it('blocks data: and other dangerous schemes', () => {
      expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
      expect(safeUrl('vbscript:msgbox(1)')).toBe('#')
    })

    it('handles missing / non-string input safely', () => {
      expect(safeUrl(null)).toBe('#')
      expect(safeUrl(undefined)).toBe('#')
      expect(safeUrl(123)).toBe('#')
    })
  })

  describe('heading spoofing (client path)', () => {
    let sanitize
    beforeAll(() => { process.client = true; sanitize = loadInjected().sanitize })
    afterAll(() => { delete process.client })

    it('keeps our own logos and the modal trigger', () => {
      const logo = 'Blog <img src="/img/HIVE.png" class="mr-2 token-logo-md" alt="">'
      expect(sanitize(logo)).toContain('src="/img/HIVE.png"')
      const info = '<a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle text-white"></i></a>'
      const out = sanitize(info)
      expect(out).toContain('href="#"')
      expect(out).toContain('data-target="#notifyModal"')
    })

    it('drops off-site images and off-site links', () => {
      const out = sanitize('<a href="https://evil.example/login"><img src="https://evil.example/fake.png"></a>')
      expect(out).not.toContain('evil.example')
      expect(out).not.toContain('<img')
      for (const href of ['//evil.example', '/\\evil.example', '/ /x']) {
        expect(sanitize(`<a href="${href}">x</a>`)).not.toContain('href=')
      }
      expect(sanitize('<img src="/img/../x.png">')).not.toContain('<img')
    })

    it('drops data-* attributes other than the modal trigger', () => {
      const out = sanitize('<a href="#" data-toggle="popover" data-html="true" data-content="<b>x</b>">x</a>')
      expect(out).not.toContain('data-content')
      expect(out).not.toContain('data-html')
    })
  })

  describe('$safeUrl leaving the site', () => {
    let safeUrl
    beforeAll(() => { safeUrl = loadInjected().safeUrl })

    it('treats only a single leading slash as local', () => {
      expect(safeUrl('/@alice')).toBe('/@alice')
      expect(safeUrl(' /@alice')).toBe('/@alice')
      for (const u of ['//evil.example', '/\\evil.example', '/\t/evil.example', ' //evil.example']) {
        expect(safeUrl(u)).toBe('#')
      }
    })
  })

  describe('$hiveProfileUrl', () => {
    let profile
    beforeAll(() => { profile = loadInjected().hiveProfileUrl })

    it('links valid account names relatively', () => {
      expect(profile('alice')).toBe('/@alice')
      expect(profile('actifit.rewards')).toBe('/@actifit.rewards')
    })

    it('gives no link for anything else', () => {
      for (const n of ['../../x', 'x/../../evil', 'x?y', 'x#y', '\\evil.com', 'ab', 'A1ice', '', null, 'a'.repeat(17)]) {
        expect(profile(n)).toBe('#')
      }
    })
  })
})
