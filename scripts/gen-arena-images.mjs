/**
 * gen-arena-images.mjs — generate promotional banners for the default Arena
 * contests via the Gemini image API (gemini-2.5-flash-image).
 *
 * Requires a billing-enabled key in the environment:
 *   GEMINI_API_KEY=... node scripts/gen-arena-images.mjs
 *
 * Writes PNGs to a temp/out dir (default ./arena-raw). They are then optimized
 * (resized + webp/jpg) into static/img/arena/ by a separate step so the repo
 * ships small assets, not 1MB PNGs.
 */
import fs from 'fs'
import path from 'path'

const KEY = process.env.GEMINI_API_KEY
if (!KEY) { console.error('GEMINI_API_KEY is required'); process.exit(1) }

const MODEL = 'gemini-2.5-flash-image'
const OUT = process.env.OUT_DIR || 'arena-raw'
fs.mkdirSync(OUT, { recursive: true })

const STYLE = 'Modern flat vector illustration, energetic and clean, Actifit brand colors ' +
  'vivid red (#e31337) and white with charcoal accents, dynamic diagonal composition, ' +
  'wide landscape banner, bright and optimistic, absolutely no text or letters or numbers, ' +
  'high quality, professional fitness marketing art.'

const IMAGES = [
  { key: 'step-league',    prompt: 'A group of diverse people walking and running upward along a rising red arrow track in a friendly step-count league, motion lines, footprints, a small medal in the sky.' },
  { key: 'daily-focus',    prompt: 'A single determined person mid-stride at sunrise hitting a daily step goal, a glowing circular progress ring around them, calm focused morning energy.' },
  { key: 'season-ladder',  prompt: 'Athletes climbing a tall leaderboard ladder toward a winners podium over a long season, ascending steps, trophy at the top, sense of a long competitive journey.' },
  { key: 'global-top',     prompt: 'A stylized globe with diverse runners circling it and a floating global leaderboard showing top ranked athletes worldwide, worldwide competition energy.' },
  { key: 'weekend-warrior',prompt: 'Energetic people doing outdoor weekend activities together — hiking, cycling and trail running in nature under a bright sky, adventurous weekend vibe.' },
  { key: 'monthly-event',  prompt: 'A month-long endurance fitness event, a marathon of runners crossing a finish line with confetti and a large calendar motif in the background, celebratory milestone.' },
]

async function gen({ key, prompt }) {
  const body = { contents: [{ parts: [{ text: `${prompt} ${STYLE}` }] }] }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const j = await r.json()
  if (j.error) throw new Error(`${key}: ${j.error.code} ${j.error.status} ${j.error.message?.slice(0, 120)}`)
  const img = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData)
  if (!img) throw new Error(`${key}: no image part`)
  const buf = Buffer.from(img.inlineData.data, 'base64')
  const file = path.join(OUT, `${key}.png`)
  fs.writeFileSync(file, buf)
  return { key, bytes: buf.length, file }
}

const results = await Promise.allSettled(IMAGES.map(gen))
for (const res of results) {
  if (res.status === 'fulfilled') console.log('OK  ', res.value.key, `${(res.value.bytes / 1024 | 0)}KB`, res.value.file)
  else console.error('FAIL', res.reason.message)
}
const ok = results.filter(r => r.status === 'fulfilled').length
console.log(`\n${ok}/${IMAGES.length} generated into ${OUT}/`)
if (ok < IMAGES.length) process.exitCode = 1
