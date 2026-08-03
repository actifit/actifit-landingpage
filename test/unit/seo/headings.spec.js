const fs = require('fs')

describe('SEO page headings', () => {
  const blogEditor = fs.readFileSync('pages/_username/blog/new.vue', 'utf8')
  const videoEditor = fs.readFileSync('pages/_username/videos/new.vue', 'utf8')
  const userRank = fs.readFileSync('pages/userrank.vue', 'utf8')
  const wallet = fs.readFileSync('pages/_username/wallet.vue', 'utf8')
  const referrals = fs.readFileSync('pages/referrals.vue', 'utf8')

  it('renders editor page headings without requiring an authenticated user', () => {
    expect(blogEditor).toContain(':username="user ? user.account.name : \'\'"')
    expect(videoEditor).toContain(':username="user ? user.account.name : \'\'"')
    expect(blogEditor).not.toContain('<div v-if="user">\n        <ListHeadingSection')
    expect(videoEditor).not.toContain('class="text-center font-weight" v-if="user"')
  })

  it('renders headings in unauthenticated user-rank and wallet states', () => {
    expect(userRank).toContain("<h1 class=\"mb-4 h3\">{{ $t('User_rank_details') }}</h1>")
    expect(wallet).toContain("<h1 class=\"mb-4 h3\">{{ $t('Wallet') }}</h1>")
    expect(referrals.match(/<ListHeadingSection :textualDisplay="\$t\('Referrals'\)" \/>/g)).toHaveLength(2)
  })

  it('does not nest the shared h1 inside another heading', () => {
    expect(wallet).not.toMatch(/<h[2-6][^>]*>\s*<ListHeadingSection/)
  })
})
