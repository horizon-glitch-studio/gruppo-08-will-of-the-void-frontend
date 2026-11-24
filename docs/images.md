# Images

Lore and tutorial images: this repository keeps only the WebP files generated, not the original assets.

## Generate

```
npm run images -- <folder with the original JPG files> src/assets/images/lore
```

The script (`scripts/images.mjs`, sharp) crops every original from the center and writes WebP files at quality 85.

| Crop | Ratio | Widths (px) |
|---|---|---|
| portrait | 3:4 | 480, 768, 1024, 1536 |
| square | 1:1 | 768, 1024, 1536, 2048 |
| landscape | 4:3 | 768, 1024, 1536, 2048 |

All crops stay in the repository; each page uses only the ones it needs:

| Page | Crops | How |
|---|---|---|
| Home hero | portrait, square, landscape | `<picture>`, the crop follows the shape of the window |
| Lore | square, landscape | `<picture>`: square on narrow phones, landscape from 40rem. Never taller than wide |
| Story (/play) | square | one `<img>` with `srcset`; the frame changes shape (3:4 to 4:3) and crops it with `object-fit: cover` |

File name: `<name>-<crop>-<width>w.webp`, for example `lore-01-portrait-768w.webp`. The originals are 2048 px squares, so a crop never goes past 1536 px on its short side.

## Use in HTML

The browser picks the crop from the shape of the window, then the width from the screen size and density.

```html
<picture>
  <source
    media="(min-aspect-ratio: 5/4)"
    srcset="/src/assets/images/lore/lore-01-landscape-768w.webp 768w, /src/assets/images/lore/lore-01-landscape-1024w.webp 1024w, /src/assets/images/lore/lore-01-landscape-1536w.webp 1536w, /src/assets/images/lore/lore-01-landscape-2048w.webp 2048w"
    sizes="100vw"
    width="2048"
    height="1536"
  />
  <source
    media="(min-aspect-ratio: 4/5)"
    srcset="/src/assets/images/lore/lore-01-square-768w.webp 768w, /src/assets/images/lore/lore-01-square-1024w.webp 1024w, /src/assets/images/lore/lore-01-square-1536w.webp 1536w, /src/assets/images/lore/lore-01-square-2048w.webp 2048w"
    sizes="100vw"
    width="2048"
    height="2048"
  />
  <img
    src="/src/assets/images/lore/lore-01-portrait-768w.webp"
    srcset="/src/assets/images/lore/lore-01-portrait-480w.webp 480w, /src/assets/images/lore/lore-01-portrait-768w.webp 768w, /src/assets/images/lore/lore-01-portrait-1024w.webp 1024w, /src/assets/images/lore/lore-01-portrait-1536w.webp 1536w"
    sizes="100vw"
    width="1536"
    height="2048"
    alt="Describe what the image shows"
    loading="lazy"
    decoding="async"
  />
</picture>
```

Rules:

- Paths start with `/src/assets/…`: Vite rewrites them in `src` and `srcset`, adds a hash and copies only the files the pages use.
- `media` thresholds: wider than 5:4 is landscape, between 4:5 and 5:4 is square, taller than 4:5 is portrait. Adjust them when the slide layout is built.
- `width` and `height` on every source and on the `img`: the browser reserves the space before the image loads, so the page does not jump.
- `sizes="100vw"` is right while the image is as wide as the window. If the layout limits it (for example, by the height of the window on desktop), set `sizes` to the real width, or the browser downloads a larger file than needed.
- `loading="lazy"` on every image except the first one visible when the page opens (first tutorial slide, top image of the lore): that one loads at once.
- `alt`: what the image shows. Empty (`alt=""`) only for purely decorative images.

## Use in React

Import the URLs with `import.meta.glob`, so Vite adds the hash, then build the same `<picture>` in JSX.

```ts
const lore = import.meta.glob('@/assets/images/lore/*.webp', { eager: true, query: '?url', import: 'default' })
```
