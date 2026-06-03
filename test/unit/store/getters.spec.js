import getters from '@/store/getters'

// The getters here are thin passthroughs to state. Rather than asserting each
// one individually, we verify the contract: every getter returns the
// same-named slice of state, and the set of getters stays in sync with usage.
describe('store/getters', () => {
  const sampleState = {
    userTokens: 5,
    transactions: [{ id: 1 }],
    proposals: ['p'],
    cartEntries: [{ _id: 1 }],
    purchaseSuccess: true,
    voteWeight: 80,
    bchain: 'hive'
  }

  it('each getter returns its matching state key', () => {
    Object.keys(getters).forEach((name) => {
      // getters are named identically to the state key they expose
      const result = getters[name](sampleState)
      expect(result).toBe(sampleState[name])
    })
  })

  it('exposes the expected core getters', () => {
    const names = Object.keys(getters)
    expect(names).toEqual(expect.arrayContaining([
      'userTokens', 'transactions', 'proposals', 'cartEntries',
      'purchaseSuccess', 'voteWeight', 'bchain'
    ]))
  })

  it('returns the exact reference, not a copy', () => {
    expect(getters.transactions(sampleState)).toBe(sampleState.transactions)
    expect(getters.cartEntries(sampleState)).toBe(sampleState.cartEntries)
  })
})
