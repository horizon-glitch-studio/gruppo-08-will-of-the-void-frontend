/**
 * Generates the responsive images of the site from the original JPG files.
 *
 * Usage: npm run images -- <folder with the originals> [output folder]
 * Default output: src/assets/images
 * For each original: one crop per ratio, every width, in WebP.
 * File name: <name>-<crop>-<width>w.webp, for example lore-01-portrait-768w.webp
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const [input, output = 'src/assets/images'] = process.argv.slice(2)

/** Crops, with the widths each one needs. The originals are 2048 px squares, centered crops. */
const CROPS = {
  square: { ratio: 1, widths: [768, 1024, 1536, 2048] },
  portrait: { ratio: 3 / 4, widths: [480, 768, 1024, 1536] },
  landscape: { ratio: 4 / 3, widths: [768, 1024, 1536, 2048] },
}

/** WebP quality, 0–100 */
const QUALITY = 85

if (!input) {
  console.error('Usage: npm run images -- <folder with the originals> [output folder]')
  process.exit(1)
}

await mkdir(output, { recursive: true })
const files = (await readdir(input)).filter((file) => /\.jpe?g$/i.test(file))

for (const file of files) {
  const name = path.parse(file).name
  for (const [crop, { ratio, widths }] of Object.entries(CROPS)) {
    for (const width of widths) {
      const height = Math.round(width / ratio)
      await sharp(path.join(input, file))
        .resize({ width, height, fit: 'cover', position: 'centre', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(path.join(output, `${name}-${crop}-${width}w.webp`))
    }
  }
  process.stdout.write(`✓ ${name}\n`)
}

process.stdout.write(`${files.length} images → ${output}\n`)
