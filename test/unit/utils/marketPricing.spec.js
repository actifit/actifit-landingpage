import {
  getProductAfitPrice,
  getProductHivePrice,
  getProductPurchaseCurrencies,
  getProductUsdValue
} from '~/utils/marketPricing'

const rates = {
  afitHiveLastPrice: 0.0002,
  afitHiveLastUsdPrice: 0.00001
}

const product = (currency, price, extra = {}) => ({
  price: [{ currency, price, ...extra }]
})

describe('market pricing', () => {
  it('keeps native AFIT prices and calculates their HIVE equivalent', () => {
    const gadget = product('AFIT', 100)

    expect(getProductAfitPrice(gadget, rates)).toBe(100)
    expect(getProductHivePrice(gadget, rates)).toBeCloseTo(0.02)
    expect(getProductUsdValue(gadget, rates)).toBeCloseTo(0.001)
  })

  it('reports currencies from actual purchase paths', () => {
    const gadget = { ...product('AFIT', 100), type: 'ingame' }
    const ebook = { ...product('AFIT', 100), type: 'ebook' }
    const splitProduct = product('USD', 10, { percent_afit: 20, percent_hive: 80 })

    expect(getProductPurchaseCurrencies(gadget)).toEqual(['AFIT', 'HIVE'])
    expect(getProductPurchaseCurrencies(ebook)).toEqual(['AFIT'])
    expect(getProductPurchaseCurrencies(splitProduct)).toEqual(['AFIT', 'HIVE'])
  })

  it('converts USD split-payment products like Product.vue', () => {
    const physicalProduct = product('USD', 10, { percent_afit: 20, percent_hive: 80 })

    expect(getProductAfitPrice(physicalProduct, rates)).toBe(200000)
    expect(getProductHivePrice(physicalProduct, rates)).toBe(160)
    expect(getProductUsdValue(physicalProduct, rates)).toBe(10)
  })

  it('does not show a HIVE component for 100-percent AFIT products', () => {
    const afitOnlyProduct = product('USD', 10, { percent_afit: 100, percent_hive: 0 })

    expect(getProductAfitPrice(afitOnlyProduct, rates)).toBe(1000000)
    expect(getProductHivePrice(afitOnlyProduct, rates)).toBeNull()
  })

  it('normalizes mixed currencies to USD for accurate sorting', () => {
    const cheapGadget = product('AFIT', 100)
    const physicalProduct = product('USD', 10, { percent_afit: 100, percent_hive: 0 })

    expect(getProductUsdValue(cheapGadget, rates)).toBeCloseTo(0.001)
    expect(getProductUsdValue(physicalProduct, rates)).toBe(10)
  })

  it('does not expose misleading converted values before rates load', () => {
    const physicalProduct = product('USD', 10, { percent_afit: 20, percent_hive: 80 })
    const gadget = product('AFIT', 100)

    expect(getProductAfitPrice(physicalProduct, 0)).toBeNull()
    expect(getProductHivePrice(physicalProduct, 0)).toBeNull()
    expect(getProductUsdValue(gadget, 0)).toBeNull()
  })
})
