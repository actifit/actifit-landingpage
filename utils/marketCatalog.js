import { getProductPurchaseCurrencies } from './marketPricing'

export function filterMarketProducts(products, currentFilter, currentStatus, gadgetStats, currentCurrency, searchQuery) {
  if (!Array.isArray(products)) {
    return []
  }

  const normalizedSearch = String(searchQuery || '').trim().toLowerCase()

  return products.filter(product => {
    if (!product || (currentFilter && product.type !== currentFilter)) {
      return false
    }
    if (currentCurrency && !getProductPurchaseCurrencies(product).includes(currentCurrency)) {
      return false
    }
    if (normalizedSearch) {
      const searchableText = [
        product.name,
        product.description,
        product.provider,
        product.provider_name
      ].filter(Boolean).join(' ').toLowerCase()
      if (!searchableText.includes(normalizedSearch)) {
        return false
      }
    }
    if (!currentStatus) {
      return true
    }

    const ownership = getGadgetOwnership(gadgetStats, product._id)
    if (currentStatus === 'active') {
      return product.type === 'ingame' && ownership.active > 0
    }
    if (currentStatus === 'inactive') {
      return product.type === 'ingame' && ownership.inactive > 0
    }
    if (currentStatus === 'available') {
      return ownership.total === 0 && Number(product.count) > 0
    }
    return true
  })
}

export function getGadgetOwnership(gadgetStats, gadgetId) {
  const ownership = { active: 0, inactive: 0, total: 0 }
  if (!Array.isArray(gadgetStats) || gadgetId == null) {
    return ownership
  }

  gadgetStats.forEach(entry => {
    if (!entry || !entry._id || String(entry._id.gadget) !== String(gadgetId)) {
      return
    }

    const status = String(entry._id.status || '').trim().toLowerCase()
    const count = Number(entry.count)
    if (!Number.isFinite(count) || count <= 0) {
      return
    }

    if (status === 'active') {
      ownership.active += count
      ownership.total += count
    } else if (status === 'bought' || status === 'inactive' || status === 'deactivated') {
      ownership.inactive += count
      ownership.total += count
    }
  })

  return ownership
}

export function getOwnedGadgetProducts(products, gadgetStats) {
  if (!Array.isArray(products)) {
    return []
  }

  return products.filter(product => (
    product &&
    product.type === 'ingame' &&
    getGadgetOwnership(gadgetStats, product._id).total > 0
  ))
}
