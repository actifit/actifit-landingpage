// Sanity check that the Jest + Babel toolchain transforms ESM and runs.
describe('toolchain smoke test', () => {
  it('runs and supports ESM syntax', () => {
    const sum = (a, b) => a + b
    expect(sum(2, 3)).toBe(5)
  })

  it('has a jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})
