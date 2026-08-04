import { getProductPurchaseCurrencies } from './marketPricing'

export function filterMarketProducts(products, currentFilter, currentStatus, gadgetStats, currentCurrency, searchQuery, buyabilityContext) {
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

    const state = getProductMarketState(product, {
      ...(buyabilityContext || {}),
      gadgetStats: buyabilityContext && buyabilityContext.gadgetStats
        ? buyabilityContext.gadgetStats
        : gadgetStats
    })
    if (currentStatus === 'active' || currentStatus === 'activated') {
      return state === 'activated'
    }
    if (currentStatus === 'inactive' || currentStatus === 'bought') {
      return state === 'bought'
    }
    if (currentStatus === 'available' || currentStatus === 'unavailable') {
      return state === currentStatus
    }
    return true
  })
}

export function getProductMarketState(product, context = {}) {
  if (!product) {
    return 'unavailable'
  }

  if (product.type === 'ingame') {
    const ownership = getGadgetOwnership(context.gadgetStats, product._id)
    if (ownership.active > 0) {
      return 'activated'
    }
    if (ownership.inactive > 0) {
      return 'bought'
    }
  }

  if (product.type === 'real' && Array.isArray(context.realProducts)) {
    const owned = context.realProducts.some(entry => (
      entry && String(entry.gadget) === String(product._id)
    ))
    if (owned) {
      return 'bought'
    }
  }

  return isProductBuyable(product, context) ? 'available' : 'unavailable'
}

export function isProductBuyable(product, context = {}) {
  if (!product) {
    return false
  }

  const inventoryManaged = product.type === 'ingame' || product.type === 'real'
  if (inventoryManaged && Number(product.count) <= 0) {
    return false
  }

  const requirements = Array.isArray(product.requirements)
    ? product.requirements.filter(requirement => requirement && requirement.item)
    : []
  if (requirements.length === 0) {
    return true
  }

  return requirements.every(requirement => {
    const item = String(requirement.item).trim().toLowerCase()
    if (item === 'user rank') {
      return Number(context.userRank) >= Number(requirement.level)
    }
    if (item === 'afit') {
      return Number(context.userTokens) >= Number(requirement.count)
    }
    if (typeof requirement.met === 'boolean') {
      return requirement.met
    }

    const catalog = Array.isArray(context.products) ? context.products : []
    const prerequisite = catalog.find(candidate => (
      candidate &&
      String(candidate.name || '').trim().toLowerCase() === item &&
      Number(candidate.level) === Number(requirement.level)
    ))
    if (!prerequisite || !Array.isArray(context.gadgetStats)) {
      return false
    }

    const consumed = context.gadgetStats.reduce((total, entry) => {
      if (!entry || !entry._id ||
          String(entry._id.gadget) !== String(prerequisite._id) ||
          String(entry._id.status || '').trim().toLowerCase() !== 'consumed') {
        return total
      }
      const count = Number(entry.count)
      return Number.isFinite(count) && count > 0 ? total + count : total
    }, 0)
    return consumed >= Number(requirement.count)
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
