export default ({ app }) => {
  if (process.client) {
    app.router.afterEach((to) => {
      const canonicalUrl = 'https://actifit.io' + to.path.replace(/\/+$/, '')
      let existing = document.querySelector('link[rel="canonical"]')
      if (existing) {
        existing.setAttribute('href', canonicalUrl)
      } else {
        let link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        link.setAttribute('href', canonicalUrl)
        document.head.appendChild(link)
      }
    })
  }
}