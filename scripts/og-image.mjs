/**
 * Generates the link preview image (Open Graph and X cards): the hero image, darkened, with the stacked wordmark and its glow.
 *
 * Usage: npm run og-image
 * Output: public/og-image.jpg, 1200×630 (the size Facebook, LinkedIn and X show in full).
 * The file name has no hash, so the address in the meta tags stays the same: run it again only when the hero image or the logo change.
 */
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630
const BACKGROUND = 'src/assets/images/lore/lore-01-landscape-2048w.webp'
const WORDMARK = 'src/assets/brand/wordmark-stacked.svg'
const OUTPUT = 'public/og-image.jpg'

/** Wordmark height, as a fraction of the image height. */
const LOGO_SCALE = 0.62

/** --color-bg (indigo-950) for the shade, --color-logo-glow (indigo-400) for the glow. */
const SHADE = '#090618'
const GLOW = '#5533ff'

/**
 * The wordmark SVG filled with one color, at the given height.
 * @param {string} color
 * @param {number} height
 */
async function wordmark(color, height) {
  const svg = (await readFile(WORDMARK, 'utf8')).replaceAll('currentColor', color)
  return sharp(Buffer.from(svg), { density: 300 }).resize({ height }).png().toBuffer()
}

const logoHeight = Math.round(HEIGHT * LOGO_SCALE)
const logo = await wordmark('#ffffff', logoHeight)
const { width: logoWidth = 0 } = await sharp(logo).metadata()
const left = Math.round((WIDTH - logoWidth) / 2)
const top = Math.round((HEIGHT - logoHeight) / 2)

// The glow: the wordmark in the glow color, blurred, under the white one (as the drop-shadow on the site)
const glow = await sharp(await wordmark(GLOW, logoHeight))
  .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .blur(14)
  .png()
  .toBuffer()

// Darker in the middle, where the wordmark sits, so it reads on every part of the image
const shade = Buffer.from(
  `<svg width="${WIDTH}" height="${HEIGHT}"><defs><radialGradient id="s" cx="50%" cy="50%" r="65%"><stop offset="0" stop-color="${SHADE}" stop-opacity="0.75"/><stop offset="1" stop-color="${SHADE}" stop-opacity="0.35"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#s)"/></svg>`,
)

await sharp(BACKGROUND)
  .resize({ width: WIDTH, height: HEIGHT, fit: 'cover', position: 'centre' })
  .composite([
    { input: shade, left: 0, top: 0 },
    { input: glow, left: left - 40, top: top - 40 },
    { input: glow, left: left - 40, top: top - 40, blend: 'screen' },
    { input: logo, left, top },
  ])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(OUTPUT)

process.stdout.write(`${OUTPUT}\n`)
