/**
 * place-arena-logos.mjs — composite the REAL Actifit + Hive logos onto the
 * generated Arena scenes, deterministically (pixel-perfect), and write the
 * optimized webp banners to static/img/arena/.
 *
 * Why not the AI editor: gemini-2.5-flash-image reproduces the simple Hive
 * hexagon well but redraws/mangles the detailed Actifit running figure at small
 * sizes (it tends to become a plain red silhouette). So the Actifit mark is
 * placed here from the real PNG on a small white "chip" (legible on any
 * background — including red-on-red), and the Hive mark is placed from its real
 * PNG too. This supersedes the earlier AI logo pass for logo fidelity.
 *
 * Pipeline: scripts/gen-arena-images.mjs (scenes) -> this script (logos).
 * Needs sharp:  npx --yes sharp-cli >/dev/null 2>&1 || npm i -D sharp
 *   SCENES_DIR=./arena-raw node scripts/place-arena-logos.mjs
 *
 * SCENES_DIR holds <key>.png scenes (default ./arena-raw). Logos are read from
 * static/img. Output webp is written straight into static/img/arena/<key>.webp.
 */
import sharp from 'sharp'
import path from 'path'

const SCENES = process.env.SCENES_DIR || 'arena-raw'
const IMG = 'static/img'
const OUT = 'static/img/arena'
const ACTIFIT = path.join(IMG, 'actifit-logo-1024.png')
const HIVE = path.join(IMG, 'HIVE.png')

// Actifit as a white pin/chip (legible anywhere); Hive as its bold hexagon.
// a: [x, y, chipDiameter]  h: [x, y, width]  — fractions of scene width, top-left anchored.
const POS = {
  'step-league':     { a: [0.665, 0.375, 0.11], h: [0.775, 0.265, 0.075] },
  'daily-focus':     { a: [0.44, 0.35, 0.10], h: [0.175, 0.415, 0.08] },
  'season-ladder':   { a: [0.50, 0.27, 0.095], h: [0.55, 0.335, 0.058] },
  'global-top':      { a: [0.485, 0.47, 0.095], h: [0.145, 0.215, 0.052] },
  'weekend-warrior': { a: [0.60, 0.45, 0.085], h: [0.71, 0.385, 0.062] },
  'monthly-event':   { a: [0.33, 0.575, 0.095], h: [0.75, 0.265, 0.052] }
}

async function actifitPin (dPx) {
  const d = Math.round(dPx)
  const stroke = Math.max(1, Math.round(d * 0.02))
  const svg = `<svg width="${d}" height="${d}" xmlns="http://www.w3.org/2000/svg"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - stroke}" fill="#ffffff" stroke="#e3e3e3" stroke-width="${stroke}"/></svg>`
  const circle = await sharp(Buffer.from(svg)).png().toBuffer()
  const logo = await sharp(ACTIFIT).resize({ width: Math.round(d * 0.62) }).png().toBuffer()
  const lm = await sharp(logo).metadata()
  return sharp(circle).composite([{ input: logo, left: Math.round((d - lm.width) / 2), top: Math.round((d - lm.height) / 2) }]).png().toBuffer()
}

async function place (key) {
  const p = POS[key]
  const src = path.join(SCENES, key + '.png')
  const { width: sw, height: sh } = await sharp(src).metadata()
  const pin = await actifitPin(sw * p.a[2])
  const hive = await sharp(HIVE).resize({ width: Math.round(sw * p.h[2]) }).png().toBuffer()
  const composed = await sharp(src).composite([
    { input: pin, left: Math.round(sw * p.a[0]), top: Math.round(sh * p.a[1]) },
    { input: hive, left: Math.round(sw * p.h[0]), top: Math.round(sh * p.h[1]) }
  ]).png().toBuffer()
  await sharp(composed).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, key + '.webp'))
  console.log('OK  ', key + '.webp')
}

for (const k of Object.keys(POS)) await place(k)
console.log('done ->', OUT)
