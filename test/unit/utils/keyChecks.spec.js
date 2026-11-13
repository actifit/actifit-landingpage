// classifyKey against the account's REAL authority lists, read from the Hive node
// (hive-js), not through actifit-bot. Every other suite mocks classifyKey away.
jest.mock('@hiveio/hive-js', () => ({
  auth: { wifToPublic: jest.fn((wif) => { if (wif === 'bad') throw new Error('bad'); return 'PUB_' + wif }) },
  api: { getAccountsAsync: jest.fn() }
}))

import hive from '@hiveio/hive-js'
import { classifyKey } from '~/utils/keyChecks'

const auth = (...pubs) => ({ key_auths: pubs.map((p) => [p, 1]) })
const alice = {
  name: 'alice',
  owner: auth('PUB_owner'),
  active: auth('PUB_active'),
  posting: auth('PUB_posting')
}

describe('classifyKey', () => {
  beforeEach(() => hive.api.getAccountsAsync.mockReset())

  it.each([
    ['owner', 'owner'], ['active', 'active'], ['posting', 'posting'], ['someoneelse', 'none']
  ])('%s key -> %s', async (wif, kind) => {
    hive.api.getAccountsAsync.mockResolvedValue([alice])
    await expect(classifyKey('alice', wif)).resolves.toBe(kind)
    expect(hive.api.getAccountsAsync).toHaveBeenCalledWith(['alice'])
  })

  it('an unparseable key is invalid, without a lookup', async () => {
    await expect(classifyKey('alice', 'bad')).resolves.toBe('invalid')
    expect(hive.api.getAccountsAsync).not.toHaveBeenCalled()
  })

  it('a failed, empty or mismatched lookup is unknown (which keyRefusal refuses)', async () => {
    hive.api.getAccountsAsync.mockRejectedValue(new Error('node down'))
    await expect(classifyKey('alice', 'posting')).resolves.toBe('unknown')
    hive.api.getAccountsAsync.mockResolvedValue([])
    await expect(classifyKey('alice', 'posting')).resolves.toBe('unknown')
    hive.api.getAccountsAsync.mockResolvedValue([Object.assign({}, alice, { name: 'mallory' })])
    await expect(classifyKey('alice', 'posting')).resolves.toBe('unknown')
  })

  it('a hung node times out as unknown', async () => {
    jest.useFakeTimers()
    hive.api.getAccountsAsync.mockReturnValue(new Promise(() => {}))
    const p = classifyKey('alice', 'posting')
    jest.advanceTimersByTime(8001)
    await expect(p).resolves.toBe('unknown')
    jest.useRealTimers()
  })
})
