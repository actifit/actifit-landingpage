import mutations from '@/store/mutations'

describe('store/mutations', () => {
  describe('simple setters', () => {
    it('setUserTokens assigns the value', () => {
      const state = { userTokens: 0 }
      mutations.setUserTokens(state, 42)
      expect(state.userTokens).toBe(42)
    })

    it('setVoteWeight assigns the value', () => {
      const state = { voteWeight: 100 }
      mutations.setVoteWeight(state, 75)
      expect(state.voteWeight).toBe(75)
    })

    it('setChatPostingKey keeps and clears the in-memory chat key', () => {
      const state = { chatPostingKey: null }
      mutations.setChatPostingKey(state, 'posting-key')
      expect(state.chatPostingKey).toBe('posting-key')

      mutations.setChatPostingKey(state, null)
      expect(state.chatPostingKey).toBeNull()
    })

    it('setUserRank stores the full object and pulls out user_rank', () => {
      const state = { userRank: 0, userRankObj: '' }
      const rankObj = { user_rank: 7, score: 1234 }
      mutations.setUserRank(state, rankObj)
      expect(state.userRankObj).toBe(rankObj)
      expect(state.userRank).toBe(7)
    })
  })

  describe('communities append/replace', () => {
    it('appendCommunitiesList pushes onto the existing array', () => {
      const state = { communitiesList: ['a'] }
      mutations.appendCommunitiesList(state, ['b', 'c'])
      expect(state.communitiesList).toEqual(['a', 'b', 'c'])
    })

    it('setCommunitiesList replaces the array', () => {
      const state = { communitiesList: ['a'] }
      mutations.setCommunitiesList(state, ['x'])
      expect(state.communitiesList).toEqual(['x'])
    })
  })

  describe('cart handling', () => {
    it('addCartEntry pushes an entry onto a fresh cart', () => {
      const state = { cartEntries: [], purchaseSuccess: false }
      mutations.addCartEntry(state, { _id: 1 })
      expect(state.cartEntries).toEqual([{ _id: 1 }])
    })

    it('addCartEntry resets the cart when following a prior successful purchase', () => {
      const state = { cartEntries: [{ _id: 99 }], purchaseSuccess: true }
      mutations.addCartEntry(state, { _id: 1 })
      expect(state.purchaseSuccess).toBe(false)
      expect(state.cartEntries).toEqual([{ _id: 1 }])
    })

    it('removeCartEntry removes the matching entry by _id only', () => {
      const state = { cartEntries: [{ _id: 1 }, { _id: 2 }, { _id: 3 }] }
      mutations.removeCartEntry(state, { _id: 2 })
      expect(state.cartEntries).toEqual([{ _id: 1 }, { _id: 3 }])
    })

    it('clearCart empties the cart', () => {
      const state = { cartEntries: [{ _id: 1 }, { _id: 2 }] }
      mutations.clearCart(state)
      expect(state.cartEntries).toEqual([])
    })
  })

  describe('updatePost', () => {
    const makePost = (author, permlink, extra = {}) => ({ author, permlink, ...extra })

    it('replaces a matching post (author + permlink) across every list it appears in', () => {
      const original = makePost('alice', 'post-1', { title: 'old' })
      const state = {
        reports: [makePost('bob', 'x'), original],
        userReports: [original],
        posts: [],
        userPosts: [makePost('carol', 'y')],
        communityPosts: [original]
      }
      const updated = makePost('alice', 'post-1', { title: 'new' })
      mutations.updatePost(state, updated)

      expect(state.reports[1]).toBe(updated)
      expect(state.userReports[0]).toBe(updated)
      expect(state.communityPosts[0]).toBe(updated)
      // untouched entries stay as they were
      expect(state.reports[0].author).toBe('bob')
      expect(state.userPosts[0].author).toBe('carol')
    })

    it('leaves lists untouched when no post matches', () => {
      const state = {
        reports: [makePost('bob', 'x')],
        userReports: [],
        posts: [],
        userPosts: [],
        communityPosts: []
      }
      mutations.updatePost(state, makePost('alice', 'nope'))
      expect(state.reports[0].author).toBe('bob')
    })

    it('does not match when permlink differs but author is the same', () => {
      const state = {
        reports: [makePost('alice', 'post-1', { title: 'keep' })],
        userReports: [], posts: [], userPosts: [], communityPosts: []
      }
      mutations.updatePost(state, makePost('alice', 'post-2', { title: 'new' }))
      expect(state.reports[0].title).toBe('keep')
    })
  })
})
