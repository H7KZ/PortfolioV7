// Side-by-side Figma vs site. usage: node tests/redesign/compare.mjs <baseUrl> <route> <width> <figmaPng> <outPrefix> [en|cs]
// Writes <outPrefix>-local.png and <outPrefix>-cmp-NN.png (Figma left, site right, 1200 px tall chunks).
import { chromium } from '@playwright/test'
import { createRequire } from 'node:module'
const sharp = createRequire(new URL('../../../cms/package.json', import.meta.url))('sharp')
const [base, route, width, figma, out, locale = 'en'] = process.argv.slice(2)
const w = Number(width)
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
await ctx.addCookies([{ name: 'locale', value: locale, url: base }])
const page = await ctx.newPage()
await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)
const local = `${out}-local.png`
await page.screenshot({ path: local, fullPage: true })
await browser.close()
const a = sharp(local), b = sharp(figma)
const [ma, mb] = await Promise.all([a.metadata(), b.metadata()])
const fig = mb.width === w ? await b.toBuffer() : await b.resize({ width: w }).toBuffer()
const fh = mb.width === w ? mb.height : Math.round(mb.height * w / mb.width)
const H = Math.max(ma.height, fh), gap = 24
const canvas = sharp({ create: { width: w * 2 + gap, height: H, channels: 3, background: '#ff00ff' } })
const full = await canvas.composite([{ input: fig, left: 0, top: 0 }, { input: local, left: w + gap, top: 0 }]).png().toBuffer()
const chunk = 1200
for (let y = 0, i = 0; y < H; y += chunk, i++) {
  const h = Math.min(chunk, H - y)
  await sharp(full).extract({ left: 0, top: y, width: w * 2 + gap, height: h }).resize({ width: Math.min(w * 2 + gap, 1800) }).png().toFile(`${out}-cmp-${String(i).padStart(2, '0')}.png`)
}
console.log(JSON.stringify({ localHeight: ma.height, figmaHeight: fh, chunks: Math.ceil(H / chunk) }))
