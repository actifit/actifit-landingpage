// A shared profile link previews with the person's Hive avatar, not the Actifit logo.
jest.mock('dsteem', () => ({ Client: jest.fn() }))
jest.mock('@hiveio/dhive', () => ({ Client: jest.fn() }))

import { profileImageMeta } from '~/utils/seo'
import Profile from '~/pages/_username/index.vue'
import Blog from '~/pages/_username/blog/index.vue'
import Videos from '~/pages/_username/videos/index.vue'
import Comments from '~/pages/_username/comments/index.vue'
import Activity from '~/pages/activity/_username/index.vue'

const AVATAR = 'https://images.hive.blog/u/alice/avatar/large'
const ogImage = (head) => head.meta.filter((m) => m.property === 'og:image')

describe('profileImageMeta', () => {
  it('gives the Hive avatar for a valid account name', () => {
    expect(profileImageMeta('alice')).toEqual([{ hid: 'ogimage', property: 'og:image', content: AVATAR }])
    expect(profileImageMeta('a-b.c1')[0].content).toBe('https://images.hive.blog/u/a-b.c1/avatar/large')
  })

  it('gives nothing for anything Hive would not allow, so the site default stays', () => {
    for (const u of ['', 'ab', 'Alice', 'a/../x', 'alice?x=1', 'a'.repeat(17), '1alice', undefined, null]) {
      expect([u, profileImageMeta(u)]).toEqual([u, []])
    }
  })
})

describe('profile pages', () => {
  it.each([
    ['profile', Profile], ['blog', Blog], ['videos', Videos], ['comments', Comments], ['activity', Activity],
  ])('%s page previews with the avatar, under the shared og:image hid', (name, page) => {
    const head = page.head.call({ username: 'alice', $route: { params: { username: '@alice' } } })
    expect(ogImage(head)).toEqual([{ hid: 'ogimage', property: 'og:image', content: AVATAR }])
    expect(head.meta.filter((m) => m.property === 'og:title')).toHaveLength(1)
  })

  it('a bad name leaves the site default image', () => {
    const head = Profile.head.call({ username: 'Bad Name' })
    expect(ogImage(head)).toEqual([])
  })
})
