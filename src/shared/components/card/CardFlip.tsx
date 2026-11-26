import type { ReactNode } from 'react'
import { CardBack } from './CardBack'

/** Props of {@link CardFlip}. */
interface CardFlipProps {
  /** false: the back is shown. true: the card turns and shows the front. */
  revealed: boolean
  /** The front, usually a CardFace. */
  children: ReactNode
  className?: string
}

/**
 * A card that turns from back to front, for pack openings (and later the battle).
 * The page decides when: set `revealed`, from a button or a timer. Until then the front is inert and hidden from screen readers,
 * so nobody reads the card before it is shown. With reduced motion the faces cross-fade instead of turning.
 */
export function CardFlip({ revealed, children, className }: CardFlipProps) {
  return (
    <div className={className ? `game-card-flip ${className}` : 'game-card-flip'} data-revealed={revealed || undefined}>
      <div className="game-card-flip-inner">
        <div className="game-card-flip-side game-card-flip-back">
          <CardBack />
        </div>
        <div className="game-card-flip-side game-card-flip-front" inert={!revealed} aria-hidden={!revealed}>
          {children}
        </div>
      </div>
    </div>
  )
}
