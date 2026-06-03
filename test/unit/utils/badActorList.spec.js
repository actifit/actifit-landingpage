import badActors from '@/utils/BadActorList'

describe('utils/BadActorList', () => {
  it('exports a non-empty array of account names', () => {
    expect(Array.isArray(badActors)).toBe(true)
    expect(badActors.length).toBeGreaterThan(100)
  })

  it('contains no empty or whitespace-only entries', () => {
    const blanks = badActors.filter(name => !name || name.trim() !== name || name.length === 0)
    expect(blanks).toEqual([])
  })

  it('includes known phishing look-alikes', () => {
    // a few representative entries pulled from the list
    expect(badActors).toContain('yobit')
    expect(badActors).toContain('zkhive')
  })

  it('can be used for fast membership checks', () => {
    const set = new Set(badActors)
    expect(set.has('yobit')).toBe(true)
    expect(set.has('definitely-not-on-the-list-123')).toBe(false)
  })
})
