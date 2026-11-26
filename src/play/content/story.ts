/*
 * The story shown before the game: 9 chapters, one image and a few lines each.
 * Text from "Will of the Void – Storia e Carte" (DGS). Images: lore-01 to lore-09 from the image pipeline (docs/images.md).
 */

const urls = import.meta.glob<string>('@/assets/images/lore/*.webp', { eager: true, query: '?url', import: 'default' })

/** The square crop of the image pipeline: the whole illustration. The story frame crops it with object-fit: cover. */
const WIDTHS = [768, 1024, 1536, 2048]

export interface StoryImage {
  srcSet: string
  /** Second smallest file, as fallback src. */
  src: string
  width: number
  height: number
}

function image(name: string): StoryImage {
  const url = (w: number) => urls[`/src/assets/images/lore/${name}-square-${w}w.webp`]
  return { srcSet: WIDTHS.map((w) => `${url(w)} ${w}w`).join(', '), src: url(WIDTHS[1]), width: 2048, height: 2048 }
}

export interface StoryChapter {
  text: string
  /** The Void speaks: shown as a quote. */
  voice?: boolean
  image: StoryImage
}

function chapter(number: number, text: string, voice = false): StoryChapter {
  const name = `lore-${String(number).padStart(2, '0')}`
  return { text, voice, image: image(name) }
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
