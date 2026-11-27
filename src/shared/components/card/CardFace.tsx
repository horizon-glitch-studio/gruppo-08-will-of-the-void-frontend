import { ShieldIcon, SwordIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import { CARD_IMAGE_SIZE, cardImage } from '../../api/card-images'
import type { Card } from '../../api/cards'
import { factionKey } from '../../factions'
import { FactionIcon } from '../FactionIcon'
import { CardFrame } from './CardFrame'

/** Rarities count from 1 (Captive) to 6 (Wanderer): one pip each. */
const RARITY_STEPS = 6

/** Props of {@link CardFace}. */
interface CardFaceProps {
  card: Card
  /** Level of the card name heading, to fit the page outline. */
  headingLevel?: 2 | 3 | 4
  /** sizes attribute of the image: how wide the card is drawn. The default fits a grid of small cards. */
  sizes?: string
  /** eager for cards visible on load (pack opening), lazy for long lists. */
  loading?: 'lazy' | 'eager'
  className?: string
}

/**
 * Front of a card: art, name, attack and defense, description, faction and rarity.
 * Every size follows the card width (container query units), so the same card works in a grid, a deck list or a pack opening:
 * give it a width from the outside (grid column, inline-size) and the height follows (2:3).
 * Border: SVG with the faction gradient. Name, description and stat boxes: CSS shapes (clip-path), frosted glass.
 * Styles: src/styles/components/card.css (global, so the static pages can use the same markup).
 * Rarity: name and pips (from 1 to 6), and a glow from Champion up.
 */
export function CardFace({ card, headingLevel = 3, sizes = '(min-width: 40rem) 16rem, 45vw', loading = 'lazy', className }: CardFaceProps) {
  const id = useId()
  const faction = factionKey(card.faction.name)
  const image = cardImage(card.imageUrl)
  const rank = card.rarity.sortOrder
  const Heading = `h${headingLevel}` as const

  return (
    <article className={className ? `game-card ${className}` : 'game-card'} data-faction={faction} data-rank={rank} aria-labelledby={`${id}-name`}>
      <div className="game-card-face">
        {image ? (
          <img
            className="game-card-art"
            src={image.src}
            srcSet={image.srcSet}
            sizes={sizes}
            width={CARD_IMAGE_SIZE.width}
            height={CARD_IMAGE_SIZE.height}
            alt={card.imageAlt ?? ''}
            loading={loading}
            decoding="async"
          />
        ) : (
          <div className="game-card-art" />
        )}

        <CardFrame />

        <header className="game-card-name">
          <Heading id={`${id}-name`} className="game-card-title">
            {card.name}
          </Heading>
        </header>

        <div className="game-card-panel">
          <p className="game-card-stat game-card-defense">
            <ShieldIcon className="game-card-stat-icon" weight="bold" aria-hidden="true" />
            <span className="visually-hidden">Defense </span>
            {/* Visible only with the "Show text labels" setting: the icon in words */}
            <span className="game-card-stat-label" aria-hidden="true">
              DEF
            </span>
            {card.defense}
          </p>
          <p className="game-card-stat game-card-attack">
            <span className="visually-hidden">Attack </span>
            <span className="game-card-stat-label" aria-hidden="true">
              ATK
            </span>
            {card.attack}
            <SwordIcon className="game-card-stat-icon" weight="bold" aria-hidden="true" />
          </p>

          {card.description && <p className="game-card-text">{card.description}</p>}

          <footer className="game-card-meta">
            <p className="game-card-faction">
              {faction && <FactionIcon faction={faction} className="game-card-faction-icon" />}
              {/* Hidden from sight unless the "Show text labels" setting is on; always read by screen readers */}
              <span className="game-card-faction-name">
                {card.faction.name}
                <span className="visually-hidden"> faction</span>
              </span>
            </p>
            <p className="game-card-rarity">
              <span>{card.rarity.name}</span>
              <span className="game-card-pips" aria-hidden="true">
                {Array.from({ length: RARITY_STEPS }, (_, index) => (
                  <span key={index} className="game-card-pip" data-on={index < rank || undefined} />
                ))}
              </span>
            </p>
          </footer>
        </div>
      </div>
    </article>
  )
}
