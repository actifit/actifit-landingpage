/**
 * The library that reads and signs for each chain a typed-key user can act on.
 *
 * Hive and Blurt both forked from Steem, so their libraries share one API
 * (api.getAccountsAsync, broadcast.send, auth.wifToPublic). Steem is not supported.
 */
import hive from '@hiveio/hive-js'
import blurt from '@blurtfoundation/blurtjs'

export const SIGNING_CHAINS = ['HIVE', 'BLURT']

// 'HIVE' for a missing or empty chain: wallet.vue defaults cur_bchain to ''.
export function normalizeChain (chain) {
  return String(chain || 'HIVE').toUpperCase()
}

export function chainClient (chain) {
  if (normalizeChain(chain) === 'BLURT') {
    // The same node the rest of the site reads Blurt from (nuxt.config.js env).
    if (process.env.blurtApiNode) blurt.api.setOptions({ url: process.env.blurtApiNode })
    return blurt
  }
  return hive
}
