import MarketPage from '~/pages/market.vue'

const fs = require('fs')

const marketPageSource = fs.readFileSync('pages/market.vue', 'utf8')

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
  it('hides category filters that have no matching catalog products', () => {
    const filterOptions = [
      { value: '', labelKey: 'All' },
      { value: 'ingame', labelKey: 'Game' },
      { value: 'service', labelKey: 'Consultation' },
      { value: 'real', labelKey: 'Physical_Products' }
    ]

    const options = MarketPage.computed.availableFilterOptions.call({
      filterOptions,
      prodList: products
    })

    expect(options).toEqual([filterOptions[0], filterOptions[1], filterOptions[3]])
  })

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

  it('places activated gadgets in the active state group', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products,
      gadgetStats,
      user: { account: { name: 'alice' } }
    })

    expect(groups[0]).toEqual({
      type: 'activated',
      labelKey: 'market_state_activated',
      items: [products[0]]
    })
  })

  it('places active special-event gadgets only in a separate Event group', () => {
    const eventProduct = {
      _id: 'seasonal',
      name: "Santa's Gift",
      type: 'ingame',
      specialevent: true,
      event: 'Christmas'
    }
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products.concat(eventProduct),
      savedProductIds: ['seasonal'],
      gadgetStats: [{ _id: { gadget: 'seasonal', status: 'active' }, count: 1 }],
      prodList: products.concat(eventProduct),
      realProducts: [],
      userRank: 0,
      userTokens: 0,
      user: { account: { name: 'alice' } }
    })

    expect(groups.filter(group => group.items.includes(eventProduct))).toEqual([{
      type: 'event',
      labelKey: 'Event',
      items: [eventProduct]
    }])
  })

  it('places bought-but-inactive gadgets in the bought state group', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products,
      prodList: products,
      savedProductIds: [],
      gadgetStats: [{ _id: { gadget: 'owned-gadget', status: 'bought' }, count: 2 }],
      realProducts: [],
      user: { account: { name: 'alice' } }
    })

    expect(groups[0]).toEqual({
      type: 'bought',
      labelKey: 'Bought',
      items: [products[0]]
    })
  })

  it('does not show the ownership section while logged out', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products,
      gadgetStats,
      user: null
    })

    expect(groups.some(group => group.type === 'bought' || group.type === 'activated')).toBe(false)
  })

  it('reports total and active ownership counts', () => {
    const context = { gadgetStats }

    expect(MarketPage.methods.ownedGadgetCount.call(context, products[0])).toBe(3)
    expect(MarketPage.methods.activeGadgetCount.call(context, products[0])).toBe(1)
  })

  it('matches the product-detail level badge colors in sidebar rows', () => {
    expect(marketPageSource).toContain('background: #eef1f4;')
    expect(marketPageSource).toContain('color: #52606d;')
    expect(marketPageSource).toContain('background: rgba(255, 255, 255, 0.08);')
    expect(marketPageSource).toContain('color: #d8dde4;')
  })

  it('marks bought-but-inactive gadgets as owned', () => {
    const context = {
      user: { account: { name: 'alice' } },
      gadgetStats: [{ _id: { gadget: 'owned-gadget', status: 'bought' }, count: 2 }]
    }

    expect(MarketPage.methods.statusDot.call(context, products[0])).toBe('owned')
  })
})
