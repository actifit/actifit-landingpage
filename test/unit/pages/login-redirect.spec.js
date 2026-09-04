import LoginPage from '~/pages/login.vue'

// Unit-call the redirect helper with a mock $route/$router (no mount).
describe('pages/login postLoginRedirect (#181 join flow)', () => {
  const run = (redirect) => {
    const pushed = []
    const ctx = { $route: { query: redirect === undefined ? {} : { redirect } }, $router: { push: (p) => pushed.push(p) } }
    LoginPage.methods.postLoginRedirect.call(ctx)
    return pushed
  }

  it('honors a same-origin relative redirect', () => {
    expect(run('/arena/def_weekly_step_league')).toEqual(['/arena/def_weekly_step_league'])
  })
  it('falls back to home when no redirect is given', () => {
    expect(run(undefined)).toEqual(['/'])
  })
  it('rejects absolute and protocol-relative URLs (open-redirect guard)', () => {
    expect(run('https://evil.example/phish')).toEqual(['/'])
    expect(run('//evil.example')).toEqual(['/'])
    expect(run('javascript:alert(1)')).toEqual(['/'])
  })
})
