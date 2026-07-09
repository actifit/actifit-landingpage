// Heavy chain libs are imported transitively by child components; stub them so
// the SFC options object loads. We only exercise the pure navigateFrom logic.
jest.mock('steem', () => ({ api: { setOptions: jest.fn() } }))
jest.mock('dsteem', () => ({ Client: jest.fn() }))
jest.mock('hive-auth-wrapper', () => ({ broadcast: jest.fn(), authenticate: jest.fn() }))

import CommunityContent from '@/components/CommunityContent.vue'

const { navigateFrom } = CommunityContent.methods

const posts = () => ([
  { author: 'alice', permlink: 'p0' },
  { author: 'bob', permlink: 'p1' },
  { author: 'carol', permlink: 'p2' }
])

function ctx (list) {
  return { communityPosts: list, $store: { commit: jest.fn() } }
}

describe('components/CommunityContent navigateFrom (modal Prev/Next)', () => {
  it('moves to the next post within this community', () => {
    const c = ctx(posts())
    const handled = navigateFrom.call(c, { author: 'bob', permlink: 'p1' }, 1)
    expect(handled).toBe(true)
    expect(c.$store.commit).toHaveBeenCalledWith('setActivePost', expect.objectContaining({ author: 'carol', permlink: 'p2', pstId: 2 }))
  })

  it('moves to the previous post within this community', () => {
    const c = ctx(posts())
    const handled = navigateFrom.call(c, { author: 'bob', permlink: 'p1' }, -1)
    expect(handled).toBe(true)
    expect(c.$store.commit).toHaveBeenCalledWith('setActivePost', expect.objectContaining({ author: 'alice', permlink: 'p0', pstId: 0 }))
  })

  it('owns the post but does NOT move past the last item (no crash, no commit)', () => {
    const c = ctx(posts())
    const handled = navigateFrom.call(c, { author: 'carol', permlink: 'p2' }, 1)
    expect(handled).toBe(true) // owned -> caller stops probing other communities
    expect(c.$store.commit).not.toHaveBeenCalled()
  })

  it('owns the post but does NOT move before the first item', () => {
    const c = ctx(posts())
    const handled = navigateFrom.call(c, { author: 'alice', permlink: 'p0' }, -1)
    expect(handled).toBe(true)
    expect(c.$store.commit).not.toHaveBeenCalled()
  })

  it('returns false when the post is not in this community (keep probing)', () => {
    const c = ctx(posts())
    const handled = navigateFrom.call(c, { author: 'dave', permlink: 'x9' }, 1)
    expect(handled).toBe(false)
    expect(c.$store.commit).not.toHaveBeenCalled()
  })

  it('returns false for a null active post', () => {
    const c = ctx(posts())
    expect(navigateFrom.call(c, null, 1)).toBe(false)
  })
})
