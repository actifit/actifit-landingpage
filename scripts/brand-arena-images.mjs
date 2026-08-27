/**
 * brand-arena-images.mjs — seamlessly weave the Actifit + Hive logos into each
 * generated Arena banner via Gemini image editing (gemini-2.5-flash-image).
 *
 * Each edit sends three images to the model: the scene banner, the Actifit logo
 * (red running figure) and the Hive logo (red hexagon), plus a per-scene
 * placement hint so the marks read as part of the illustration (on a jersey, in
 * the sun, on the calendar) rather than a pasted-on watermark.
 *
 *   GEMINI_API_KEY=... node scripts/brand-arena-images.mjs
 *
 * Inputs default to the committed banners so the step is reproducible from repo
 * assets; override with SRC_DIR. Outputs PNGs to OUT_DIR (default ./arena-branded).
 */
import fs from 'fs'
import path from 'path'

const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('GEMINI_API_KEY is required'); process.exit(1) }

const MODEL = 'gemini-2.5-flash-image'
const SRC = process.env.SRC_DIR || 'static/img/arena'
const OUT = process.env.OUT_DIR || 'arena-branded'
const ACTIFIT_LOGO = process.env.ACTIFIT_LOGO || 'static/img/actifit-logo-1024.png'
const HIVE_LOGO = process.env.HIVE_LOGO || 'static/img/HIVE.png'
fs.mkdirSync(OUT, { recursive: true })

const COMMON = 'Edit the FIRST image (a flat-vector fitness challenge banner). Seamlessly integrate ' +
  'the two brand logos so they look native and intentional — part of the illustration, matching its ' +
  'flat-vector style, colors and lighting — NOT a sticker, badge overlay or watermark. The SECOND image ' +
  'is the Actifit logo (a red running figure). The THIRD image is the Hive logo (a red hexagon mark). ' +
  'Keep the original composition, characters, colors and mood unchanged. Make both logos small and tasteful. ' +
  'Do not add any text, letters or numbers.'

const PLACEMENTS = {
  'step-league': 'Put the Actifit running-figure logo small on the leading runner\'s jersey/t-shirt, and place the Hive hexagon as a subtle emblem on the medal in the sky.',
  'daily-focus': 'Put the Actifit running-figure logo on the runner\'s t-shirt, and blend the Hive hexagon into the center of the glowing sunrise ring behind her.',
  'season-ladder': 'Put the Actifit running-figure logo on a climbing figure\'s shirt, and place the Hive hexagon as an emblem on the front face of the winners\' podium.',
  'global-top': 'Put the Actifit running-figure logo on a runner\'s jersey, and place the Hive hexagon as an emblem in the header of the floating leaderboard panel.',
  'weekend-warrior': 'Put the Actifit running-figure logo on a hiker\'s backpack or a cyclist\'s jersey, and blend the Hive hexagon into the sun on the right.',
  'monthly-event': 'Place the Hive hexagon as a small emblem in the top corner of the big calendar, and put the Actifit running-figure logo on the finish-line ribbon the runners are breaking.'
}

function inlinePng (file) {
  return { inline_data: { mime_type: 'image/png', data: fs.readFileSync(file).toString('base64') } }
}
function inlineAny (file) {
  const ext = path.extname(file).toLowerCase()
  const mime = ext === '.webp' ? 'image/webp' : 'image/png'
  return { inline_data: { mime_type: mime, data: fs.readFileSync(file).toString('base64') } }
}

const actifit = inlinePng(ACTIFIT_LOGO)
const hive = inlinePng(HIVE_LOGO)

async function brand (key) {
  const src = fs.existsSync(path.join(SRC, key + '.png')) ? path.join(SRC, key + '.png') : path.join(SRC, key + '.webp')
  const parts = [
    { text: `${COMMON} ${PLACEMENTS[key]}` },
    inlineAny(src),
    actifit,
    hive
  ]
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }] }) })
  const j = await r.json()
  if (j.error) throw new Error(`${key}: ${j.error.code} ${j.error.status} ${j.error.message?.slice(0, 120)}`)
  const img = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData)
  if (!img) throw new Error(`${key}: no image part returned`)
  const buf = Buffer.from(img.inlineData.data, 'base64')
  const out = path.join(OUT, key + '.png')
  fs.writeFileSync(out, buf)
  return { key, bytes: buf.length, out }
}

const keys = Object.keys(PLACEMENTS)
const results = await Promise.allSettled(keys.map(brand))
for (const res of results) {
  if (res.status === 'fulfilled') console.log('OK  ', res.value.key, `${(res.value.bytes / 1024 | 0)}KB`)
  else console.error('FAIL', res.reason.message)
}
const ok = results.filter(r => r.status === 'fulfilled').length
console.log(`\n${ok}/${keys.length} branded into ${OUT}/`)
if (ok < keys.length) process.exitCode = 1
