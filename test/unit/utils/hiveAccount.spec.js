// Unknown profile URLs answer 404 only when Hive says the account does not exist.
// A network problem must never turn a real profile into a 404.
import { isValidHiveAccountName, hiveAccountExists } from '~/utils/hiveAccount'

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
