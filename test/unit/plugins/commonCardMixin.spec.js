// commonCardMixin imports steem + hive-js at module load; stub them so importing
// the mixin has no side effects. We only exercise the pure getResizedImageUrl logic.
jest.mock('steem', () => ({}))
jest.mock('@hiveio/hive-js', () => ({}))

import { commonCardMixin } from '@/plugins/commonCardMixin'

const { getResizedImageUrl } = commonCardMixin.methods

describe('commonCardMixin.getResizedImageUrl', () => {
  it('proxies a normal external image through the Hive resizer', () => {
    expect(getResizedImageUrl('https://example.com/pic.png', 350))
      .toBe('https://images.hive.blog/350x0/https://example.com/pic.png')
  })

  // Regression: Actifit's own upload host (usermedia.actifit.io) is NOT served by
  // the Hive image proxy — it returns 403 — so those images must be used directly,
  // otherwise post/card previews for Actifit-hosted images render broken.
  it('serves usermedia.actifit.io images directly (Hive proxy 403s that host)', () => {
    const url = 'https://usermedia.actifit.io/MS4O55L7RQDBFPXM1TB9OSX81DK1JR'
    expect(getResizedImageUrl(url, 350)).toBe(url)
  })

  it('leaves gif and leopedia.io images untouched (pre-existing bypasses)', () => {
    expect(getResizedImageUrl('https://x.com/a.gif', 350)).toBe('https://x.com/a.gif')
    expect(getResizedImageUrl('https://leopedia.io/img.png', 350)).toBe('https://leopedia.io/img.png')
  })

  it('returns non-http / non-string input unchanged', () => {
    expect(getResizedImageUrl('/local/relative.png', 350)).toBe('/local/relative.png')
    expect(getResizedImageUrl(null, 350)).toBe(null)
  })
})
