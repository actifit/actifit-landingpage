// classifyKey recognises a Hive key on Blurt by comparing public keys without their prefix.
// That rests on one fact, checked here with the REAL libraries (other suites mock them):
// one private key gives the same public key body on Hive (STM...) and Blurt (BLT...).
import hive from '@hiveio/hive-js'
import blurt from '@blurtfoundation/blurtjs'

describe('one private key on Hive and Blurt', () => {
  it('has the same public key body, with each chain\'s prefix', () => {
    const wif = hive.auth.toWif('someuser', 'not-a-real-password', 'posting')
    const onHive = hive.auth.wifToPublic(wif)
    const onBlurt = blurt.auth.wifToPublic(wif)
    expect(onHive.slice(0, 3)).toBe('STM')
    expect(onBlurt.slice(0, 3)).toBe('BLT')
    expect(onBlurt.slice(3)).toBe(onHive.slice(3))
  })

  it('different private keys have different bodies', () => {
    const a = hive.auth.wifToPublic(hive.auth.toWif('someuser', 'one', 'posting'))
    const b = blurt.auth.wifToPublic(hive.auth.toWif('someuser', 'two', 'posting'))
    expect(a.slice(3)).not.toBe(b.slice(3))
  })
})
