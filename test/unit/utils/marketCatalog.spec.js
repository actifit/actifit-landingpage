import {
  filterMarketProducts,
  getGadgetOwnership,
  getOwnedGadgetProducts
} from '~/utils/marketCatalog'

const products = [
  { _id: 'regular', name: 'Water Bottle', type: 'ingame' },
  { _id: 'seasonal', name: "Santa's Gift", type: 'ingame', specialevent: true, event: 'Christmas' },
  { _id: 'physical', name: 'Jump Ropes', type: 'real' }
]

describe('market catalog filtering', () => {
  it('includes regular and seasonal products in the complete catalog', () => {
    expect(filterMarketProducts(products, '')).toEqual(products)
  })

  it('keeps seasonal gadgets in their API-defined category', () => {
    expect(filterMarketProducts(products, 'ingame').map(product => product._id)).toEqual([
      'regular',
      'seasonal'
    ])
  })

  it('returns an empty catalog for invalid product data', () => {
    expect(filterMarketProducts(null, '')).toEqual([])
  })

  it('filters active and inactive ownership independently', () => {
    const stats = [
      { _id: { gadget: 'regular', status: 'active' }, count: 1 },
      { _id: { gadget: 'regular', status: 'bought' }, count: 2 },
      { _id: { gadget: 'seasonal', status: 'bought' }, count: 1 }
    ]

    expect(filterMarketProducts(products, '', 'active', stats).map(product => product._id)).toEqual(['regular'])
    expect(filterMarketProducts(products, '', 'inactive', stats).map(product => product._id)).toEqual([
      'regular',
      'seasonal'
    ])
  })

  it('shows only in-stock, currently unowned products as available', () => {
    const catalog = products.concat({ _id: 'sold-out', name: 'Sold Out', type: 'ingame', count: 0 })
      .map(product => ({ count: 1, ...product }))
    const stats = [{ _id: { gadget: 'regular', status: 'bought' }, count: 1 }]

    expect(filterMarketProducts(catalog, '', 'available', stats).map(product => product._id)).toEqual([
      'seasonal',
      'physical'
    ])
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
