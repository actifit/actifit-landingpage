// 3Speak videos through its embed service. actifit-bot holds the API key and hands out a
// one-time upload token (POST /video/uploadToken); the browser sends the file straight to
// 3Speak by TUS with it. actifit-bot then links the video to the post whose permlink is the
// video's permlink, so the post must keep that permlink exactly.
// Mirrors ThreeSpeakVideo.java in the Android app.

export const EMBED_BASE = 'https://embed2.3speak.tv'
export const PLAYER_BASE = 'https://play.3speak.tv/embed?v='
export const STATUS_MISSING = 'missing'
export const STATUS_POSTED = 'posted'

// 3Speak requires these on every video post
export const VIDEO_BENEFICIARIES = [
  { account: 'encoder.pay', weight: 100 },
  { account: 'threespeakfund', weight: 1000 },
]
const MAX_BENEFICIARIES = 4
const FULL_WEIGHT = 10000

export const statusUrl = (permlink) => EMBED_BASE + '/video/' + encodeURIComponent(permlink)
export const embedUrl = (owner, permlink) => PLAYER_BASE + owner + '/' + permlink
export const watchUrl = (owner, permlink) => 'https://3speak.tv/watch?v=' + owner + '/' + permlink

// The player line (Hive frontends turn it into a player), then a link for apps that don't.
// With a frame the link is the frame: the first image becomes the post's cover.
export function reportSnippet (owner, permlink, embed, thumbnailUrl) {
  const watch = watchUrl(owner, permlink)
  const link = thumbnailUrl
    ? '[![Watch on 3speak.tv](' + thumbnailUrl + ')](' + watch + ')'
    : '▶ [Watch on 3speak.tv](' + watch + ')'
  return embed + '\n\n' + link
}

export function withVideoAtTop (content, owner, permlink, embed, thumbnailUrl) {
  const text = content || ''
  if (embed && text.includes(embed)) return text
  const snippet = reportSnippet(owner, permlink, embed, thumbnailUrl)
  return text.trim() ? snippet + '\n\n' + text : snippet
}

// json_metadata.video. PeakD and Ecency build the player from info.author and info.permlink.
export function videoMetadata ({ owner, permlink, embed, title, duration, thumbnailUrl }) {
  const info = { platform: '3speak', author: owner, permlink, title: title || '' }
  if (duration > 0) info.duration = duration
  info.sourceMap = thumbnailUrl ? [{ type: 'thumbnail', url: thumbnailUrl }] : []
  const video = { platform: '3speak', url: embed, reusable: false }
  if (thumbnailUrl) video.thumbnail = thumbnailUrl
  video.info = info
  return video
}

// The user's beneficiaries plus 3Speak's, sorted as Hive requires. null when they don't fit.
export function withVideoBeneficiaries (entries) {
  const required = VIDEO_BENEFICIARIES.map((b) => b.account)
  const own = (entries || [])
    .filter((e) => !required.includes(e.account))
    .map((e) => ({ account: e.account, weight: Math.round(e.weight) }))
  const list = [...own, ...VIDEO_BENEFICIARIES.map((b) => ({ ...b }))]
    .sort((a, b) => (a.account < b.account ? -1 : (a.account > b.account ? 1 : 0)))
  const total = list.reduce((sum, b) => sum + b.weight, 0)
  if (list.length > MAX_BENEFICIARIES || total > FULL_WEIGHT || list.some((b) => !(b.weight > 0))) return null
  return list
}

// Only once 3Speak has the file, or right after this browser finished sending it
// ("uploading" can lag behind).
export function canAttach (status, uploadedHere) {
  if (status === 'processing' || status === 'published') return true
  return !!uploadedHere && status === 'uploading'
}

// An upload as the page shows it: our server's row plus 3Speak's status (null: unreachable).
export function fromStatus (owner, row, status) {
  const video = {
    owner,
    permlink: row.permlink,
    embed_url: row.embed_url || embedUrl(owner, row.permlink),
    created: row.created,
    status: '',
    encodingProgress: 0,
    duration: 0,
    thumbnail_url: null,
    title: '',
  }
  if (!status) return video
  if (!status.status) return { ...video, status: STATUS_MISSING }
  const thumb = status.thumbnail_url
  return {
    ...video,
    status: status.status,
    encodingProgress: Number(status.encodingProgress) || 0,
    duration: Number(status.duration) || 0,
    thumbnail_url: thumb && thumb !== 'null' ? thumb : null,
    title: status.originalFilename || status.filename || '',
  }
}

async function apiJson (url, options, fetchImpl) {
  const res = await fetchImpl(url, options)
  let body = null
  try { body = await res.json() } catch (e) { /* not JSON */ }
  // the session check answers 200 with { error } or { success: false, message }
  if (!res.ok || !body || body.error || body.success === false) {
    throw new Error((body && (body.error || body.message)) || 'HTTP ' + res.status)
  }
  return body
}

export function requestUploadToken (apiUrl, sessionToken, fetchImpl = fetch) {
  return apiJson(apiUrl + 'video/uploadToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-acti-token': 'Bearer ' + sessionToken },
    body: JSON.stringify({ short: false }),
  }, fetchImpl)
}

export async function listUploads (apiUrl, sessionToken, fetchImpl = fetch) {
  const body = await apiJson(apiUrl + 'video/myUploads', {
    headers: { 'x-acti-token': 'Bearer ' + sessionToken },
  }, fetchImpl)
  return Array.isArray(body.uploads) ? body.uploads : []
}

// 3Speak's public status. null when it can't be reached; { error } for an unknown video.
export async function fetchVideoStatus (permlink, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(statusUrl(permlink))
    return await res.json()
  } catch (e) {
    return null
  }
}
