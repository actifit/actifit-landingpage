/**
 * place-arena-logos.mjs — print the REAL Actifit + Hive logos onto the generated
 * Arena scenes, deterministically, and write the optimized webp banners to
 * static/img/arena/.
 *
 * Why not the AI editor: gemini-2.5-flash-image reproduces the simple Hive
 * hexagon well but redraws/mangles the detailed Actifit running figure at small
 * sizes, drifts the Hive placement, and sometimes adds a (mis)spelled wordmark.
 * So both marks are composited from their real PNGs here — pixel-perfect and
 * consistent. The Actifit mark is printed FLAT onto a large surface in each
 * scene (the arrow, road, globe, mountain, calendar; the white podium block for
 * season-ladder), recolored white on dark/red surfaces so it reads like printed
 * signage and never covers a runner. Supersedes the earlier AI logo pass.
 *
 * Pipeline: scripts/gen-arena-images.mjs (scenes) -> this script (logos).
 * Needs sharp:  npm i -D sharp
 *   SCENES_DIR=./arena-raw node scripts/place-arena-logos.mjs
 */
import sharp from 'sharp'
import path from 'path'

const SCENES = process.env.SCENES_DIR || 'arena-raw'
const IMG = 'static/img'
const OUT = 'static/img/arena'
const ACTIFIT = path.join(IMG, 'actifit-logo-1024.png')
const HIVE = path.join(IMG, 'HIVE.png')

// a:[x,y,w,color]  color 'w'=white (dark/red surface) 'r'=red (light surface)
// h:[x,y,w]  — fractions of scene width, top-left anchored. Tuned by eye.
const POS = {
  'step-league':     { a: [0.24, 0.735, 0.10, 'w'], h: [0.775, 0.285, 0.055] }, // arrow / medal
  'daily-focus':     { a: [0.40, 0.60, 0.14, 'w'], h: [0.175, 0.415, 0.08] },   // road band / sun
  'season-ladder':   { a: [0.545, 0.30, 0.055, 'r'], h: [0.55, 0.345, 0.05] },  // podium block / podium
  'global-top':      { a: [0.47, 0.70, 0.085, 'w'], h: [0.33, 0.205, 0.042] },  // globe / leaderboard header
  'weekend-warrior': { a: [0.115, 0.47, 0.09, 'w'], h: [0.71, 0.385, 0.062] },  // mountain / sun
  'monthly-event':   { a: [0.58, 0.36, 0.10, 'w'], h: [0.75, 0.265, 0.052] }    // calendar / calendar corner
}

let whiteBuf
async function whiteLogo () {
  if (whiteBuf) return whiteBuf
  const m = await sharp(ACTIFIT).metadata()
  const alpha = await sharp(ACTIFIT).ensureAlpha().extractChannel('alpha').raw().toBuffer()
  whiteBuf = await sharp({ create: { width: m.width, height: m.height, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .joinChannel(alpha, { raw: { width: m.width, height: m.height, channels: 1 } })
    .png().toBuffer()
  return whiteBuf
}

async function place (key) {
  const p = POS[key]
  const src = path.join(SCENES, key + '.png')
  const { width: sw, height: sh } = await sharp(src).metadata()
  const base = p.a[3] === 'w' ? await whiteLogo() : ACTIFIT
  const actifit = await sharp(base).resize({ width: Math.round(sw * p.a[2]) }).png().toBuffer()
  const hive = await sharp(HIVE).resize({ width: Math.round(sw * p.h[2]) }).png().toBuffer()
  const composed = await sharp(src).composite([
    { input: actifit, left: Math.round(sw * p.a[0]), top: Math.round(sh * p.a[1]) },
    { input: hive, left: Math.round(sw * p.h[0]), top: Math.round(sh * p.h[1]) }
  ]).png().toBuffer()
  await sharp(composed).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, key + '.webp'))
  console.log('OK  ', key + '.webp')
}

for (const k of Object.keys(POS)) await place(k)
console.log('done ->', OUT)
