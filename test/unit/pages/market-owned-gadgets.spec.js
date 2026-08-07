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

  it('does not repeat saved products in the catalog groups', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: products,
      savedProductIds: ['available-gadget'],
      gadgetStats: [],
      user: null
    })

    expect(groups.find(group => group.type === 'saved').items).toEqual([products[1]])
    expect(groups.some(group => group.items.includes(products[1]) && group.type !== 'saved')).toBe(false)
  })

  it('does not surface saved products that are filtered out', () => {
    const groups = MarketPage.computed.groupedProducts.call({
      filteredProducts: [products[0]],
      prodList: products,
      savedProductIds: ['physical'],
      gadgetStats: [],
      user: null
    })

    expect(groups.some(group => group.type === 'saved')).toBe(false)
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
      type: 'saved',
      labelKey: 'saved_products',
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

  it('sorts price with null-valued products last', () => {
    const pricedLow = {
      _id: 'priced-low',
      name: 'Low Price',
      type: 'real',
      price: [{ currency: 'USD', price: 10, percent_afit: 0, percent_hive: 100 }]
    }
    const pricedHigh = {
      _id: 'priced-high',
      name: 'High Price',
      type: 'real',
      price: [{ currency: 'USD', price: 20, percent_afit: 0, percent_hive: 100 }]
    }
    const noUsdValue = {
      _id: 'no-usd',
      name: 'No USD Value',
      type: 'real',
      price: [{ currency: 'BTC', price: 1000 }]
    }

    const context = {
      prodList: [noUsdValue, pricedLow, pricedHigh],
      afitPrice: { afitHiveLastUsdPrice: 1, afitHiveLastPrice: 1 },
      currentSort: JSON.stringify({ value: 'price', direction: 'desc' }),
      ensureSelection: jest.fn(),
      $forceUpdate: jest.fn()
    }

    MarketPage.methods.reorderProducts.call(context)

    expect(context.prodList).toEqual([pricedHigh, pricedLow, noUsdValue])
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

  it('allows the market sidebar and price column to shrink at phone widths', () => {
    expect(marketPageSource).toContain('grid-template-columns: minmax(0, 1fr);')
    expect(marketPageSource).toMatch(/\.market-sidebar\s*\{[\s\S]*?min-width: 0;[\s\S]*?overflow: visible;/)
    expect(marketPageSource).toMatch(/\.sidebar-row-side\s*\{[\s\S]*?flex: 0 1 auto;[\s\S]*?min-width: 0;/)
    expect(marketPageSource).toContain('overflow-wrap: anywhere;')
    expect(marketPageSource).toContain('@media (max-width: 360px)')
  })

  it('opens mobile product details at the panel and restores the list position on back', () => {
    const originalPageYOffset = window.pageYOffset
    const originalScrollTo = window.scrollTo
    Object.defineProperty(window, 'pageYOffset', { configurable: true, value: 640 })
    window.scrollTo = jest.fn()

    const context = {
      selectedProductId: null,
      mobileShowDetail: false,
      mobileListScrollY: 0,
      isMobileMarketView: () => true,
      scrollToDetailPanel: jest.fn(),
      $nextTick: callback => callback()
    }

    MarketPage.methods.selectProduct.call(context, { _id: 'available-gadget' })

    expect(context.selectedProductId).toBe('available-gadget')
    expect(context.mobileShowDetail).toBe(true)
    expect(context.mobileListScrollY).toBe(640)
    expect(context.scrollToDetailPanel).toHaveBeenCalledTimes(1)

    MarketPage.methods.backToList.call(context)

    expect(context.mobileShowDetail).toBe(false)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'auto' })

    window.scrollTo = originalScrollTo
    Object.defineProperty(window, 'pageYOffset', { configurable: true, value: originalPageYOffset })
  })

  it('positions mobile product details below the fixed header', () => {
    const originalPageYOffset = window.pageYOffset
    const originalScrollTo = window.scrollTo
    Object.defineProperty(window, 'pageYOffset', { configurable: true, value: 300 })
    window.scrollTo = jest.fn()

    MarketPage.methods.scrollToDetailPanel.call({
      $refs: {
        detailPanelSection: {
          getBoundingClientRect: () => ({ top: 500 })
        }
      }
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 712, behavior: 'auto' })

    window.scrollTo = originalScrollTo
    Object.defineProperty(window, 'pageYOffset', { configurable: true, value: originalPageYOffset })
  })

  it('marks bought-but-inactive gadgets as owned', () => {
    const context = {
      user: { account: { name: 'alice' } },
      gadgetStats: [{ _id: { gadget: 'owned-gadget', status: 'bought' }, count: 2 }]
    }

    expect(MarketPage.methods.statusDot.call(context, products[0])).toBe('owned')
  })
})
