/*
 * Card images are served by the backend in three widths (api-contract-draft/02-cards-collection-decks.md):
 * <imageUrl>-320w.webp, <imageUrl>-640w.webp, <imageUrl>-848w.webp. They are public and need no token.
 * Host: VITE_ASSETS_BASE_URL, or else VITE_API_BASE_URL without /api/v1 (the backend serves them from its root).
 */

const WIDTHS = [320, 640, 848] as const

/** Size of the largest file (about 2:3), for the width and height attributes: the browser reserves the space before the image loads. */
export const CARD_IMAGE_SIZE = { width: 848, height: 1264 }

function assetsBaseUrl() {
  const assets = import.meta.env.VITE_ASSETS_BASE_URL?.trim()
  const base = assets || import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/api\/v1\/?$/, '')
  return (base ?? '').replace(/\/+$/, '')
}

/** src and srcset of a card image from its imageUrl; null when the card has no image. Add sizes where the image is used. */
export function cardImage(imageUrl: string | null) {
  if (!imageUrl) return null
  const url = (width: number) => `${assetsBaseUrl()}${imageUrl}-${width}w.webp`
  return { src: url(640), srcSet: WIDTHS.map((width) => `${url(width)} ${width}w`).join(', ') }
}
