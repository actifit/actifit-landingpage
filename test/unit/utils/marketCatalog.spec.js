import {
  filterMarketProducts,
  getGadgetLevelClass,
  getGadgetOwnership,
  getOwnedGadgetProducts,
  getProductMarketState,
  isProductBuyable
} from '~/utils/marketCatalog'

const products = [
  { _id: 'regular', name: 'Water Bottle', type: 'ingame' },
  { _id: 'seasonal', name: "Santa's Gift", type: 'ingame', specialevent: true, event: 'Christmas' },
  { _id: 'physical', name: 'Jump Ropes', type: 'real' }
]

describe('market catalog filtering', () => {
  it('maps supported gadget levels to stable styling classes', () => {
    expect(getGadgetLevelClass(1)).toBe('gadget-level-1')
    expect(getGadgetLevelClass('2')).toBe('gadget-level-2')
    expect(getGadgetLevelClass(3)).toBe('gadget-level-3')
    expect(getGadgetLevelClass(4)).toBe('')
    expect(getGadgetLevelClass(null)).toBe('')
  })

  it('hides inactive seasonal products from the complete catalog', () => {
    expect(filterMarketProducts(products, '')).toEqual([products[0], products[2]])
  })

  it('shows seasonal gadgets only while they are active', () => {
    const activeStats = [{ _id: { gadget: 'seasonal', status: 'active' }, count: 1 }]
    const inactiveStats = [{ _id: { gadget: 'seasonal', status: 'bought' }, count: 1 }]

    expect(filterMarketProducts(products, 'ingame', '', activeStats).map(product => product._id)).toEqual([
      'regular', 'seasonal'
    ])
    expect(filterMarketProducts(products, 'ingame', '', inactiveStats).map(product => product._id)).toEqual(['regular'])
  })

  it('returns an empty catalog for invalid product data', () => {
    expect(filterMarketProducts(null, '')).toEqual([])
  })

  it('separates activated products from bought-but-inactive products', () => {
    const stats = [
      { _id: { gadget: 'regular', status: 'active' }, count: 1 },
      { _id: { gadget: 'regular', status: 'bought' }, count: 2 },
      { _id: { gadget: 'seasonal', status: 'bought' }, count: 1 }
    ]

    expect(filterMarketProducts(products, '', 'active', stats).map(product => product._id)).toEqual(['regular'])
    expect(filterMarketProducts(products, '', 'inactive', stats)).toEqual([])
  })

  it('shows only in-stock, currently unowned products as available', () => {
    const catalog = products.concat({ _id: 'sold-out', name: 'Sold Out', type: 'ingame', count: 0 })
      .map(product => ({ count: 1, ...product }))
    const stats = [{ _id: { gadget: 'regular', status: 'bought' }, count: 1 }]

    expect(filterMarketProducts(catalog, '', 'available', stats).map(product => product._id)).toEqual([
      'physical'
    ])
  })

  it('does not mark in-stock products as available when user requirements fail', () => {
    const restricted = {
      _id: 'restricted',
      type: 'ingame',
      count: 1,
      requirements: [{ item: 'User Rank', level: 10 }]
    }

    expect(isProductBuyable(restricted, { userRank: 5 })).toBe(false)
    expect(isProductBuyable(restricted, { userRank: 10 })).toBe(true)
    expect(filterMarketProducts(
      [restricted], '', 'available', [], '', '', { userRank: 5 }
    )).toEqual([])
  })

  it('only applies stock availability to inventory-managed products', () => {
    expect(isProductBuyable({ type: 'ingame', count: 0 })).toBe(false)
    expect(isProductBuyable({ type: 'real', count: 0 })).toBe(false)
    expect(isProductBuyable({ type: 'ebook' })).toBe(true)
    expect(isProductBuyable({ type: 'ebook', count: 0 })).toBe(true)
    expect(isProductBuyable({ type: 'service', count: 0 })).toBe(true)
  })

  it('assigns each product a single prioritized market state', () => {
    const product = { _id: 'regular', type: 'ingame', count: 1 }

    expect(getProductMarketState(product, {
      gadgetStats: [{ _id: { gadget: 'regular', status: 'active' }, count: 1 }]
    })).toBe('activated')
    expect(getProductMarketState(product, {
      gadgetStats: [{ _id: { gadget: 'regular', status: 'bought' }, count: 1 }]
    })).toBe('bought')
    expect(getProductMarketState(product)).toBe('available')
    expect(getProductMarketState({ ...product, count: 0 })).toBe('unavailable')
  })

  it('combines category and ownership-status filters', () => {
    const stats = [{ _id: { gadget: 'regular', status: 'active' }, count: 1 }]

    expect(filterMarketProducts(products, 'real', 'active', stats)).toEqual([])
  })

  it('filters by accepted purchase currency', () => {
    const catalog = [
      { _id: 'gadget', type: 'ingame', price: [{ currency: 'AFIT', price: 30 }] },
      { _id: 'ebook', type: 'ebook', price: [{ currency: 'AFIT', price: 50 }] },
      { _id: 'physical', type: 'real', price: [{ currency: 'USD', price: 10, percent_afit: 0, percent_hive: 100 }] }
    ]

    expect(filterMarketProducts(catalog, '', '', [], 'HIVE').map(product => product._id)).toEqual([
      'gadget',
      'physical'
    ])
    expect(filterMarketProducts(catalog, '', '', [], 'AFIT').map(product => product._id)).toEqual([
      'gadget',
      'ebook'
    ])
  })

  it('searches product names, descriptions, and providers case-insensitively', () => {
    const catalog = [
      { _id: 'rope', name: 'Jump Rope', description: 'Fitness equipment', provider: 'actifit' },
      { _id: 'book', name: 'Training Guide', description: 'Running tips', provider_name: 'Alice' }
    ]

    expect(filterMarketProducts(catalog, '', '', [], '', 'JUMP').map(product => product._id)).toEqual(['rope'])
    expect(filterMarketProducts(catalog, '', '', [], '', 'alice').map(product => product._id)).toEqual(['book'])
    expect(filterMarketProducts(catalog, '', '', [], '', 'running').map(product => product._id)).toEqual(['book'])
  })
})

describe('owned gadget catalog', () => {
  const gadgetStats = [
    { _id: { gadget: 'regular', status: 'active' }, count: 2 },
    { _id: { gadget: 'regular', status: 'bought' }, count: 3 },
    { _id: { gadget: 'seasonal', status: 'inactive' }, count: 1 },
    { _id: { gadget: 'physical', status: 'active' }, count: 4 }
  ]

  it('combines active and bought-but-inactive inventory into the owned count', () => {
    expect(getGadgetOwnership(gadgetStats, 'regular')).toEqual({
      active: 2,
      inactive: 3,
      total: 5
    })
  })

  it('lists each owned in-game gadget once, including seasonal gadgets', () => {
    expect(getOwnedGadgetProducts(products, gadgetStats).map(product => product._id)).toEqual([
      'regular',
      'seasonal'
    ])
  })

  it('does not treat physical products or zero-count records as owned gadgets', () => {
    const stats = [{ _id: { gadget: 'regular', status: 'active' }, count: 0 }]

    expect(getOwnedGadgetProducts(products, stats)).toEqual([])
  })

  it('does not present fully consumed gadgets as currently owned', () => {
    const stats = [{ _id: { gadget: 'regular', status: 'consumed' }, count: 2 }]

    expect(getOwnedGadgetProducts(products, stats)).toEqual([])
  })
})
