import { useId } from 'react'
import symbol from '@/assets/brand/symbol-color-512w.webp'
import { CardFrame } from './CardFrame'

/** Props of {@link CardBack}. */
interface CardBackProps {
  /** Accessible name when the back is shown on its own ("Unrevealed card"). Leave it out inside CardFlip, where the back is decorative. */
  label?: string
  className?: string
}

/** The four-point stars of the back: four corners, top and bottom middle. */
const SPARKLES = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'] as const

/** Same numbers on every render, so every card back has the same sky (same generator as the hub Starfield). */
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TONES = ['indigo', 'violet', 'purple'] as const

/** Symbol (center and radius) and wordmark band in the 200 × 300 box: no star on them. */
const SYMBOL = { x: 100, y: 129, r: 66 }
const WORDMARK = { top: 238, bottom: 266 }

/**
 * A sparse sky like the hub one: white stars with a small halo of their tone, and a few colored ones.
 * Coordinates in the 200 × 300 card box, outside the symbol and the wordmark.
 */
const STARS = (() => {
  const random = seededRandom(21)
  const stars = []
  while (stars.length < 36) {
    const x = random() * 200
    const y = random() * 300
    const r = 0.4 + random() ** 3 * 1.1
    const white = random() < 0.65
    const tone = TONES[Math.floor(random() * TONES.length)]
    const onSymbol = Math.hypot(x - SYMBOL.x, y - SYMBOL.y) < SYMBOL.r
    const onWordmark = y > WORDMARK.top && y < WORDMARK.bottom
    if (!onSymbol && !onWordmark) stars.push({ x: x.toFixed(1), y: y.toFixed(1), r, white, tone })
  }
  return stars
})()

/**
 * Back of a card, after the design team mockup: a starry sky, orbits with a crosshair between the inner and the outer orbit,
 * the Void symbol in the middle, four-point stars, a thin inner frame and the wordmark.
 * Border in the primary panel gradient. Same size rules as CardFace: width from the outside, height follows (2:3).
 */
export function CardBack({ label, className }: CardBackProps) {
  const id = useId()
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
  return (
    <div className={className ? `game-card ${className}` : 'game-card'} {...a11y}>
      <div className="game-card-face game-card-back">
        <div className="game-card-art" />
        <svg className="game-card-back-stars" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            {TONES.map((tone) => (
              <radialGradient key={tone} id={`${id}-${tone}`} data-tone={tone}>
                <stop offset="0%" className="game-card-back-halo" />
                <stop offset="100%" className="game-card-back-halo" stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          {STARS.map((star, index) => (
            <g key={index} data-tone={star.tone}>
              {star.white && <circle fill={`url(#${id}-${star.tone})`} cx={star.x} cy={star.y} r={(star.r * 3).toFixed(2)} />}
              <circle className={star.white ? 'game-card-back-star' : 'game-card-back-star-colored'} cx={star.x} cy={star.y} r={star.r.toFixed(2)} />
            </g>
          ))}
        </svg>
        <div className="game-card-back-orbits" />
        <CardFrame />
        <span className="game-card-back-inner" />
        {SPARKLES.map((place) => (
          <span key={place} className="game-card-back-sparkle" data-place={place} />
        ))}
        <img className="game-card-back-symbol" src={symbol} alt="" width={512} height={512} draggable={false} decoding="async" />
        <span className="game-card-back-wordmark" />
      </div>
    </div>
  )
}
