import disableEmailObfuscation from '../../../middleware/disable-email-obfuscation'
import fs from 'fs'

describe('disable-email-obfuscation middleware', () => {
  it('sets no-transform when Cache-Control is absent', () => {
    const res = {
      getHeader: jest.fn(),
      setHeader: jest.fn()
    }

    disableEmailObfuscation({ res })

    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-transform')
  })

  it('preserves existing Cache-Control directives', () => {
    const res = {
      getHeader: jest.fn(() => 'public, max-age=3600'),
      setHeader: jest.fn()
    }

    disableEmailObfuscation({ res })

    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=3600, no-transform'
    )
  })

  it('does nothing during client-side navigation', () => {
    expect(() => disableEmailObfuscation({})).not.toThrow()
  })

  it.each([
    'pages/privacy-policy.vue',
    'pages/terms-conditions.vue'
  ])('protects the direct mail link on %s', pagePath => {
    const page = fs.readFileSync(pagePath, 'utf8')

    expect(page).toContain("middleware: 'disable-email-obfuscation'")
    expect(page).toContain('href="mailto:hello@actifit.io"')
    expect(page).not.toContain('/cdn-cgi/l/email-protection')
  })
})
