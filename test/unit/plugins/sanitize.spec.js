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

    it('allows blockchain and contact schemes', () => {
      expect(safeUrl('hive:alice')).toBe('hive:alice')
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
})
