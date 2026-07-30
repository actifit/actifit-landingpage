export const SITE_URL = 'https://actifit.io'

export function getCanonicalUrl (routePath = '/') {
  const path = typeof routePath === 'string'
    ? routePath.split('?')[0].split('#')[0]
    : '/'
  const pathWithLeadingSlash = path.startsWith('/') ? path : `/${path}`
  const normalizedPath = pathWithLeadingSlash.replace(/\/+$/, '')

  return SITE_URL + normalizedPath
}
