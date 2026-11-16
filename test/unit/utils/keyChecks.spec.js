// classifyKey against the account's REAL authority lists, read from the Hive node
// (hive-js), not through actifit-bot. Every other suite mocks classifyKey away.
jest.mock('@hiveio/hive-js', () => ({
  auth: { wifToPublic: jest.fn((wif) => { if (wif === 'bad') throw new Error('bad'); return 'PUB_' + wif }) },
  api: { getAccountsAsync: jest.fn() }
}))

jest.mock('@blurtfoundation/blurtjs', () => ({
  api: { getAccountsAsync: jest.fn(), setOptions: jest.fn() }
}))

import hive from '@hiveio/hive-js'
import blurt from '@blurtfoundation/blurtjs'
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

// Blurt lists the same keys with a BLT prefix where Hive uses STM: one private key gives
// the same key body on both chains, which is how a Hive login key is recognised on Blurt.
describe('classifyKey on Blurt', () => {
  const blurtAlice = {
    name: 'alice',
    owner: auth('BLT_owner'),
    active: auth('BLT_active'),
    posting: auth('BLT_posting')
  }
  beforeEach(() => { hive.api.getAccountsAsync.mockReset(); blurt.api.getAccountsAsync.mockReset() })

  it.each([
    ['owner', 'owner'], ['active', 'active'], ['posting', 'posting'], ['someoneelse', 'none']
  ])('%s key -> %s, read from the Blurt node only', async (wif, kind) => {
    blurt.api.getAccountsAsync.mockResolvedValue([blurtAlice])
    await expect(classifyKey('alice', wif, 'BLURT')).resolves.toBe(kind)
    expect(blurt.api.getAccountsAsync).toHaveBeenCalledWith(['alice'])
    expect(hive.api.getAccountsAsync).not.toHaveBeenCalled()
  })

  it('a key that changed on Blurt but not on Hive is not a Blurt key', async () => {
    blurt.api.getAccountsAsync.mockResolvedValue([Object.assign({}, blurtAlice, { posting: auth('BLT_rotated') })])
    await expect(classifyKey('alice', 'posting', 'BLURT')).resolves.toBe('none')
  })

  it('a failed Blurt lookup is unknown', async () => {
    blurt.api.getAccountsAsync.mockRejectedValue(new Error('node down'))
    await expect(classifyKey('alice', 'posting', 'BLURT')).resolves.toBe('unknown')
  })
})
