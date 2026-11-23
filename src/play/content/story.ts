/*
 * The story shown before the game: 9 chapters, one image and a few lines each.
 * Text from "Will of the Void – Storia e Carte" (DGS). Images: lore-01 to lore-09 from the image pipeline (docs/images.md).
 */

const urls = import.meta.glob<string>('@/assets/images/lore/*.webp', { eager: true, query: '?url', import: 'default' })

/** Crops made by the image pipeline, with their widths and full size. */
const crops = {
  portrait: { widths: [480, 768, 1024, 1536], width: 1536, height: 2048 },
  square: { widths: [768, 1024, 1536, 2048], width: 2048, height: 2048 },
  landscape: { widths: [768, 1024, 1536, 2048], width: 2048, height: 1536 },
} as const

export type Crop = keyof typeof crops

export interface StoryImage {
  srcSet: string
  /** Smallest file, as fallback src. */
  src: string
  width: number
  height: number
}

function image(name: string, crop: Crop): StoryImage {
  const { widths, width, height } = crops[crop]
  const url = (w: number) => urls[`/src/assets/images/lore/${name}-${crop}-${w}w.webp`]
  return { srcSet: widths.map((w) => `${url(w)} ${w}w`).join(', '), src: url(widths[1]), width, height }
}

export interface StoryChapter {
  text: string
  /** The Void speaks: shown as a quote. */
  voice?: boolean
  images: Record<Crop, StoryImage>
}

function chapter(number: number, text: string, voice = false): StoryChapter {
  const name = `lore-${String(number).padStart(2, '0')}`
  return { text, voice, images: { portrait: image(name, 'portrait'), square: image(name, 'square'), landscape: image(name, 'landscape') } }
}

export const story: StoryChapter[] = [
  chapter(1, 'Before the stars, there was the Void. It had no name. Only… hunger.'),
  chapter(2, 'It swallowed light, comets, entire worlds. Without ever truly tasting them.'),
  chapter(3, 'Then, one day, it tasted the energy of a battle. Stronger than light. Sweeter than any world.'),
  chapter(4, 'Since that day, the Void seems to have a will of its own. And that will wants only one thing: more battles.'),
  chapter(5, 'So it called the worlds of the galaxy to its side. But not to devour them.'),
  chapter(6, 'Send your fighters into my Arena. As long as you fight, your worlds will stay whole. The Energy of your battles is all I need.', true),
  chapter(7, 'Some answered. They are called Summoners.'),
  chapter(8, 'From every world, creatures board the Summoners’ Ships. Not for glory: they fight so that the Void stays fed, and their worlds stay whole.'),
  chapter(9, 'The Void is hungry. And you, Summoner, will you answer the call?'),
]
