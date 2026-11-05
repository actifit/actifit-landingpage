/**
 * Pricing rules for the wallet's "Account Estimated Value" (pages/_username/wallet.vue).
 * Kept here, outside the page, so they can be unit tested.
 */

// Price of a Hive-Engine token in HIVE, from the market metrics. A token with no
// market price is not counted (it used to be counted at 1 HIVE each); SWAP.HIVE has
// no market of its own because it is pegged to HIVE.
export function heTokenPriceHive (symbol, metrics) {
  const m = Array.isArray(metrics) ? metrics.find(v => v && v.symbol === symbol) : null
  const p = m ? parseFloat(m.lastPrice) : NaN
  if (p > 0) return p
  return symbol === 'SWAP.HIVE' ? 1 : 0
}

// USD value of the BSC AFIT and AFITX, at the same per-token prices as the Actifit
// and Hive-Engine balances. The BSC pool prices (/AFITBSCPrice, /AFITXBSCPrice) are
// 150-360x the Hive-Engine market and put a $600k total on a ~$9k account.
export function bscValuesUSD ({ afitBSC, afitxBSC, afitPriceUSD, afitxPriceHive, hivePriceUSD }) {
  return {
    afit: (parseFloat(afitBSC) || 0) * afitPriceUSD,
    afitx: (parseFloat(afitxBSC) || 0) * afitxPriceHive * hivePriceUSD
  }
}

// The live prices the total needs on a chain. The dollar-pegged price (from CoinGecko,
// which rate-limits) only when the account holds any.
export function neededPrices (chain, account, claimablePegged) {
  const u = account || {}
  const pegged = chain === 'STEEM' ? u.sbd_balance : u.hbd_balance
  const holdsPegged = parseFloat(pegged) > 0 || parseFloat(claimablePegged) > 0
  if (chain === 'STEEM') return ['afit', 'hive', 'steem'].concat(holdsPegged ? ['sbd'] : [])
  if (chain === 'BLURT') return ['afit', 'hive', 'blurt']
  return ['afit', 'hive'].concat(holdsPegged ? ['hbd'] : [])
}

// Symbols to fetch market metrics for: the tokens of interest plus every held token.
// Fetched by symbol because the whole table has more rows (1,270+) than one call
// returns (1,000), so some held tokens used to come back with no price.
export function metricsSymbols (always, balances) {
  const symbols = always.slice()
  ;(balances || []).forEach(t => {
    if (t && t.symbol && !symbols.includes(t.symbol)) symbols.push(t.symbol)
  })
  return symbols
}
