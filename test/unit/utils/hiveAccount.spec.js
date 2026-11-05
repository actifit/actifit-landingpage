// Unknown profile URLs answer 404 only when Hive says the account does not exist.
// A network problem must never turn a real profile into a 404.
import { isValidHiveAccountName, hiveAccountExists, clearHiveAccountCache } from '~/utils/hiveAccount'

const reply = (body, ok = true) => jest.fn().mockResolvedValue({ ok, json: async () => body })

describe('isValidHiveAccountName', () => {
  it.each(['actifit', 'mcfarhat', 'abc', 'a-b-c', 'hive.blog', 'user123', 'exchange'])('accepts %s', (n) => {
    expect(isValidHiveAccountName(n)).toBe(true)
  })
  it.each(['zzqqxx-not-a-user', 'ab', 'Actifit', '1abc', 'abc-', 'ab.cde', '', 'a_b_c', 'some page'])('rejects %s', (n) => {
    expect(isValidHiveAccountName(n)).toBe(false)
  })
})

describe('hiveAccountExists', () => {
  const node = 'https://node.test'
  beforeEach(() => clearHiveAccountCache())

  it('is false for a name that cannot exist, without a lookup', async () => {
    const f = jest.fn()
    expect(await hiveAccountExists('zzqqxx-not-a-user', { node, fetchImpl: f })).toBe(false)
    expect(f).not.toHaveBeenCalled()
  })
  it('is false when the node returns no such account', async () => {
    const f = reply({ jsonrpc: '2.0', result: [], id: 1 })
    expect(await hiveAccountExists('zzqqxx', { node, fetchImpl: f })).toBe(false)
    const [url, opts] = f.mock.calls[0]
    expect(url).toBe(node)
    expect(JSON.parse(opts.body)).toMatchObject({ method: 'condenser_api.get_accounts', params: [['zzqqxx']] })
  })
  it('is true for an existing account', async () => {
    expect(await hiveAccountExists('actifit', { node, fetchImpl: reply({ result: [{ name: 'actifit' }] }) })).toBe(true)
  })
  it('is null (unknown) when the node fails, errors, or is slow', async () => {
    expect(await hiveAccountExists('actifit', { node, fetchImpl: jest.fn().mockRejectedValue(new Error('ECONNRESET')) })).toBe(null)
    expect(await hiveAccountExists('actifit', { node, fetchImpl: reply({}, false) })).toBe(null)
    expect(await hiveAccountExists('actifit', { node, fetchImpl: reply({ error: { message: 'busy' } }) })).toBe(null)
    expect(await hiveAccountExists('actifit', { node, fetchImpl: () => new Promise(() => {}), timeoutMs: 10 })).toBe(null)
    expect(await hiveAccountExists('actifit', { node: '', fetchImpl: reply({ result: [] }) })).toBe(null)
  })
})

describe('hiveAccountExists: abort and cache', () => {
  const node = 'https://node.test'
  const none = () => jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: [] }) })
  beforeEach(() => clearHiveAccountCache())

  it('aborts a lookup that timed out', async () => {
    let signal
    const f = jest.fn((url, opts) => { signal = opts.signal; return new Promise(() => {}) })
    expect(await hiveAccountExists('actifit', { node, fetchImpl: f, timeoutMs: 10 })).toBe(null)
    expect(signal.aborted).toBe(true)
  })
  it('remembers yes and no for 5 minutes, then asks again', async () => {
    const f = none()
    const t0 = 1000000
    expect(await hiveAccountExists('ghost', { node, fetchImpl: f, now: t0 })).toBe(false)
    expect(await hiveAccountExists('ghost', { node, fetchImpl: f, now: t0 + 60000 })).toBe(false)
    expect(f).toHaveBeenCalledTimes(1)
    await hiveAccountExists('ghost', { node, fetchImpl: f, now: t0 + 5 * 60000 + 1 })
    expect(f).toHaveBeenCalledTimes(2)
  })
  it('does not cache an unknown answer', async () => {
    const f = jest.fn().mockRejectedValue(new Error('down'))
    await hiveAccountExists('actifit', { node, fetchImpl: f })
    await hiveAccountExists('actifit', { node, fetchImpl: f })
    expect(f).toHaveBeenCalledTimes(2)
  })
  it('holds at most 500 names', async () => {
    const f = none()
    for (let i = 0; i < 501; i++) await hiveAccountExists('user' + i, { node, fetchImpl: f })
    expect(f).toHaveBeenCalledTimes(501)
    await hiveAccountExists('user0', { node, fetchImpl: f }) // evicted, asked again
    await hiveAccountExists('user500', { node, fetchImpl: f }) // still cached
    expect(f).toHaveBeenCalledTimes(502)
  })
})
