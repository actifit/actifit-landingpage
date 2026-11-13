import { fetchJsonShared, clearSharedFetchCache } from '@/utils/sharedFetch'

function jsonResponse (data, ok = true, status = 200) {
  return Promise.resolve({ ok, status, json: () => Promise.resolve(data) })
}

describe('fetchJsonShared', () => {
  let now
  beforeEach(() => {
    clearSharedFetchCache()
    global.fetch = jest.fn()
    now = 1000000
    jest.spyOn(Date, 'now').mockImplementation(() => now)
  })
  afterEach(() => {
    Date.now.mockRestore()
  })

  it('sends one request for callers asking for the same URL at once', async () => {
    global.fetch.mockReturnValue(jsonResponse({ rank: 5 }))
    const results = await Promise.all([
      fetchJsonShared('https://api/x'),
      fetchJsonShared('https://api/x'),
      fetchJsonShared('https://api/x')
    ])
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(results).toEqual([{ rank: 5 }, { rank: 5 }, { rank: 5 }])
  })

  it('reuses an answer within the TTL and fetches again after it', async () => {
    global.fetch.mockReturnValue(jsonResponse({ v: 1 }))
    await fetchJsonShared('https://api/x', 1000)
    now += 999
    await fetchJsonShared('https://api/x', 1000)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    now += 1
    await fetchJsonShared('https://api/x', 1000)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('keeps different URLs apart', async () => {
    global.fetch.mockImplementation(url => jsonResponse({ url }))
    expect(await fetchJsonShared('https://api/a')).toEqual({ url: 'https://api/a' })
    expect(await fetchJsonShared('https://api/b')).toEqual({ url: 'https://api/b' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('rejects on a non-2xx answer and does not keep it', async () => {
    global.fetch.mockReturnValueOnce(jsonResponse({ error: 'busy' }, false, 503))
    await expect(fetchJsonShared('https://api/x')).rejects.toThrow('HTTP 503')
    global.fetch.mockReturnValueOnce(jsonResponse({ v: 2 }))
    expect(await fetchJsonShared('https://api/x')).toEqual({ v: 2 })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('does not keep a network failure', async () => {
    global.fetch.mockReturnValueOnce(Promise.reject(new Error('offline')))
    await expect(fetchJsonShared('https://api/x')).rejects.toThrow('offline')
    global.fetch.mockReturnValueOnce(jsonResponse({ v: 3 }))
    expect(await fetchJsonShared('https://api/x')).toEqual({ v: 3 })
  })

  it('does not let an expired failure evict the newer entry', async () => {
    let failOld
    global.fetch.mockReturnValueOnce(new Promise((resolve, reject) => { failOld = reject }))
    const old = fetchJsonShared('https://api/x', 1000)
    now += 1000 // the in-flight entry expires; a new request replaces it
    global.fetch.mockReturnValueOnce(jsonResponse({ v: 'new' }))
    expect(await fetchJsonShared('https://api/x', 1000)).toEqual({ v: 'new' })
    failOld(new Error('late failure'))
    await expect(old).rejects.toThrow('late failure')
    await fetchJsonShared('https://api/x', 1000)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('holds at most 500 URLs, dropping the oldest', async () => {
    global.fetch.mockImplementation(() => jsonResponse({}))
    for (let i = 0; i <= 500; i++) await fetchJsonShared('https://api/' + i)
    expect(global.fetch).toHaveBeenCalledTimes(501)
    await fetchJsonShared('https://api/500') // newest: still kept
    expect(global.fetch).toHaveBeenCalledTimes(501)
    await fetchJsonShared('https://api/0') // oldest: dropped
    expect(global.fetch).toHaveBeenCalledTimes(502)
  })
})
