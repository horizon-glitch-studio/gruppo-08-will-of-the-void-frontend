/**
 * Generates the favicons from the colored logo: the logo on a dark rounded square.
 *
 * Usage: npm run favicons -- <colored logo PNG, at least 512 px>
 * Output in public/: favicon.ico (16, 32, 48 px) and apple-touch-icon.png (180 px).
 */
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const [input] = process.argv.slice(2)

/** Background: --color-bg (indigo-950). */
const BACKGROUND = '#090618'

if (!input) {
  console.error('Usage: npm run favicons -- <colored logo PNG>')
  process.exit(1)
}

/**
 * The logo centered on a dark square.
 * @param {number} size side in px
 * @param {number} padding space around the logo, as a fraction of the side
 * @param {number} radius corner radius, as a fraction of the side (0 = square)
 */
async function icon(size, padding, radius) {
  const inset = Math.round(size * padding)
  const logo = await sharp(input)
    .resize(size - 2 * inset)
    .png()
    .toBuffer()
  const layers = [{ input: logo, left: inset, top: inset }]
  if (radius > 0) {
    const r = Math.round(size * radius)
    const mask = `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="#fff"/></svg>`
    layers.push({ input: Buffer.from(mask), blend: 'dest-in' })
  }
  return sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite(layers)
    .png()
    .toBuffer()
}

/**
 * ICO file with PNG images inside (supported by every current browser and by Windows since Vista).
 * @param {{ size: number, png: Buffer }[]} images
 */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i
    header.writeUInt8(size, entry) // width
    header.writeUInt8(size, entry + 1) // height
    header.writeUInt16LE(1, entry + 4) // color planes
    header.writeUInt16LE(32, entry + 6) // bits per pixel
    header.writeUInt32LE(png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += png.length
  })
  return Buffer.concat([header, ...images.map(({ png }) => png)])
}

const favicon = await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await icon(size, 0.06, 0.2) })))
await writeFile('public/favicon.ico', ico(favicon))

// Square corners: iOS rounds them itself
await writeFile('public/apple-touch-icon.png', await icon(180, 0.1, 0))

process.stdout.write('public/favicon.ico, public/apple-touch-icon.png\n')
