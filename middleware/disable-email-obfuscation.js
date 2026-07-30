export default function ({ res }) {
  if (!res) return

  const existingHeader = res.getHeader('Cache-Control')
  const cacheControl = existingHeader
    ? `${existingHeader}, no-transform`
    : 'no-transform'

  res.setHeader('Cache-Control', cacheControl)
}
