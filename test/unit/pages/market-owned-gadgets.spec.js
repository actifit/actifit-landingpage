import MarketPage from '~/pages/market.vue'

const products = [
  { _id: 'owned-gadget', name: 'Water Bottle', type: 'ingame' },
  { _id: 'available-gadget', name: 'Sports Hat', type: 'ingame' },
  { _id: 'physical', name: 'Jump Ropes', type: 'real' }
]

const gadgetStats = [
  { _id: { gadget: 'owned-gadget', status: 'active' }, count: 1 },
  { _id: { gadget: 'owned-gadget', status: 'bought' }, count: 2 }
]

describe('market owned-gadgets section', () => {
  it('places browser-saved products in their own leading group', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products,
      savedProductIds: ['physical'],
      gadgetStats: [],
      user: null
    })

    expect(groups[0]).toEqual({
      type: 'saved',
      labelKey: 'saved_products',
      items: [products[2]]
    })
  })

  it('places owned gadgets first for a logged-in user', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products,
      gadgetStats,
      user: { account: { name: 'alice' } }
    })

    expect(groups[0]).toEqual({
      type: 'owned',
      labelKey: 'my_gadgets',
      items: [products[0]]
    })
  })

  it('does not show the ownership section while logged out', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products,
      gadgetStats,
      user: null
    })

    expect(groups.some(group => group.type === 'owned')).toBe(false)
  })

  it('reports total and active ownership counts', () => {
    const context = { gadgetStats }

    expect(MarketPage.methods.ownedGadgetCount.call(context, products[0])).toBe(3)
    expect(MarketPage.methods.activeGadgetCount.call(context, products[0])).toBe(1)
  })

  it('marks bought-but-inactive gadgets as owned', () => {
    const context = {
      user: { account: { name: 'alice' } },
      gadgetStats: [{ _id: { gadget: 'owned-gadget', status: 'bought' }, count: 2 }]
    }

    expect(MarketPage.methods.statusDot.call(context, products[0])).toBe('owned')
  })
})
