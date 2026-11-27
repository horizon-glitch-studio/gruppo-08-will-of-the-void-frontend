import { useId } from 'react'

/**
 * Card outline drawn in SVG, scaled with the card: one path with cut corners, stroked with a three-stop gradient.
 * The stops read --_from, --_mid and --_to from CSS (card.css), so faction and Void colors live in the stylesheet.
 */
export function CardFrame() {
  const id = useId()
  return (
    <svg className="game-card-frame" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-border`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0.2" className="game-card-stop-from" />
          <stop offset="0.5" className="game-card-stop-mid" />
          <stop offset="0.8" className="game-card-stop-to" />
        </linearGradient>
      </defs>
      {/* The stroke keeps its width when the card scales */}
      <path d="M0 12.5 12.5 0H187.5L200 12.5V287.5L187.5 300H12.5L0 287.5Z" stroke={`url(#${id}-border)`} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
