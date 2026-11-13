import { isValidHiveAccountName } from './hiveAccount'

export const SITE_URL = 'https://actifit.io'

export function getCanonicalUrl (routePath = '/') {
  const path = typeof routePath === 'string'
    ? routePath.split('?')[0].split('#')[0]
    : '/'
  const pathWithLeadingSlash = path.startsWith('/') ? path : `/${path}`
  const normalizedPath = pathWithLeadingSlash.replace(/\/+$/, '')

  return SITE_URL + normalizedPath
}

// Share-preview image for a profile page: the account's Hive avatar (512 px, served by
// images.hive.blog), so a shared profile shows the person rather than the Actifit logo.
// Nothing for a name Hive would not allow, so the site default stays.
export function profileImageMeta (username) {
  if (!isValidHiveAccountName(username)) return []
  return [{ hid: 'ogimage', property: 'og:image', content: `https://images.hive.blog/u/${username}/avatar/large` }]
}
