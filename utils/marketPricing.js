function getPriceEntry(product) {
  if (!product || !Array.isArray(product.price) || !product.price.length) {
    return null
  }

  const entry = product.price[0]
  const price = Number(entry.price)
  if (!Number.isFinite(price)) {
    return null
  }

  return {
    ...entry,
    currency: String(entry.currency || '').toUpperCase(),
    price
  }
}

function getRates(afitPrice) {
  const afitUsd = Number(afitPrice && afitPrice.afitHiveLastUsdPrice)
  const afitHive = Number(afitPrice && afitPrice.afitHiveLastPrice)
  const validAfitUsd = Number.isFinite(afitUsd) && afitUsd > 0
  const validAfitHive = Number.isFinite(afitHive) && afitHive > 0

  return {
    afitUsd: validAfitUsd ? afitUsd : null,
    afitHive: validAfitHive ? afitHive : null,
    hiveUsd: validAfitUsd && validAfitHive ? afitUsd / afitHive : null
  }
}

export function getProductPurchaseCurrencies(product) {
  const entry = getPriceEntry(product)
  if (!entry) {
    return []
  }

  const currencies = []
  if (entry.currency === 'USD') {
    if (Number(entry.percent_afit) > 0) {
      currencies.push('AFIT')
    }
    if (Number(entry.percent_hive) > 0) {
      currencies.push('HIVE')
    }
    return currencies
  }

  if (entry.currency === 'AFIT' || entry.currency === 'HIVE') {
    currencies.push(entry.currency)
  }

  // In-game gadgets expose a second, converted HIVE purchase action.
  if (product.type === 'ingame' && entry.currency === 'AFIT') {
    currencies.push('HIVE')
  }
  return currencies
}

export function getProductAfitPrice(product, afitPrice) {
  const entry = getPriceEntry(product)
  if (!entry) {
    return null
  }

  if (entry.currency === 'AFIT') {
    return entry.price
  }

  const rates = getRates(afitPrice)
  if (entry.currency === 'USD') {
    const percentAfit = Number(entry.percent_afit)
    if (!rates.afitUsd || !Number.isFinite(percentAfit)) {
      return null
    }
    return Number((entry.price * percentAfit / 100 / rates.afitUsd).toFixed(2))
  }

  if (entry.currency === 'HIVE' && rates.afitHive) {
    return Number((entry.price / rates.afitHive).toFixed(2))
  }

  return null
}

export function getProductHivePrice(product, afitPrice) {
  const entry = getPriceEntry(product)
  if (!entry) {
    return null
  }

  const rates = getRates(afitPrice)
  if (entry.currency === 'AFIT') {
    return rates.afitHive ? entry.price * rates.afitHive : null
  }

  if (entry.currency === 'USD') {
    const percentHive = Number(entry.percent_hive)
    if (!rates.hiveUsd || !Number.isFinite(percentHive) || percentHive <= 0) {
      return null
    }
    return Number((entry.price * percentHive / 100 / rates.hiveUsd).toFixed(2))
  }

  if (entry.currency === 'HIVE') {
    return entry.price
  }

  return null
}

export function getProductUsdValue(product, afitPrice) {
  const entry = getPriceEntry(product)
  if (!entry) {
    return null
  }

  if (entry.currency === 'USD') {
    return entry.price
  }

  const rates = getRates(afitPrice)
  if (entry.currency === 'AFIT') {
    return rates.afitUsd ? entry.price * rates.afitUsd : null
  }

  if (entry.currency === 'HIVE') {
    return rates.hiveUsd ? entry.price * rates.hiveUsd : null
  }

  return null
}
