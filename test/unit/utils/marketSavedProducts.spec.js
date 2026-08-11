import {
  MARKET_SAVED_PRODUCTS_KEY,
  loadSavedProductIds,
  storeSavedProductIds,
  toggleSavedProductId
} from '~/utils/marketSavedProducts'

describe('saved market products', () => {
  it('loads unique string IDs and tolerates invalid storage data', () => {
    const storage = { getItem: jest.fn(() => '[1,"1","two",null]') }
    expect(loadSavedProductIds(storage)).toEqual(['1', 'two'])

    storage.getItem.mockReturnValue('{broken')
    expect(loadSavedProductIds(storage)).toEqual([])
  })

  it('adds and removes a saved product ID', () => {
    expect(toggleSavedProductId([], 10)).toEqual(['10'])
    expect(toggleSavedProductId(['10', '20'], 10)).toEqual(['20'])
  })

  it('persists normalized IDs', () => {
    const storage = { setItem: jest.fn() }
    expect(storeSavedProductIds(storage, [1, '1', '2'])).toEqual(['1', '2'])
    expect(storage.setItem).toHaveBeenCalledWith(MARKET_SAVED_PRODUCTS_KEY, '["1","2"]')
  })

  it('keeps the in-memory selection when browser storage is unavailable', () => {
    const storage = { setItem: jest.fn(() => { throw new Error('blocked') }) }
    expect(storeSavedProductIds(storage, ['one'])).toEqual(['one'])
  })
})
