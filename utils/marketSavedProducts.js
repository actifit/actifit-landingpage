export const MARKET_SAVED_PRODUCTS_KEY = 'actifit_market_saved_products'

export function normalizeSavedProductIds(value) {
  if (!Array.isArray(value)) {
    return []
  }
  return [...new Set(value.filter(id => id != null).map(id => String(id)))]
}

export function loadSavedProductIds(storage) {
  if (!storage || typeof storage.getItem !== 'function') {
    return []
  }
  try {
    return normalizeSavedProductIds(JSON.parse(storage.getItem(MARKET_SAVED_PRODUCTS_KEY) || '[]'))
  } catch (error) {
    return []
  }
}

export function storeSavedProductIds(storage, ids) {
  const normalizedIds = normalizeSavedProductIds(ids)
  if (storage && typeof storage.setItem === 'function') {
    try {
      storage.setItem(MARKET_SAVED_PRODUCTS_KEY, JSON.stringify(normalizedIds))
    } catch (error) {
      // Saving is optional; keep the in-memory selection if storage is unavailable.
    }
  }
  return normalizedIds
}

export function toggleSavedProductId(ids, productId) {
  const normalizedIds = normalizeSavedProductIds(ids)
  const id = String(productId)
  return normalizedIds.includes(id)
    ? normalizedIds.filter(savedId => savedId !== id)
    : normalizedIds.concat(id)
}
