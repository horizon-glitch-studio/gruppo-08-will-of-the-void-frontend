// oxlint-disable react/only-export-components -- rendered in Node at build time, never hot-reloaded in a page
import { CubeIcon, ShieldIcon, SwordIcon } from '@phosphor-icons/react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Card } from '@/shared/api/cards'
import cards from '@/shared/api/mock/cards.json'
import { CardBack } from '@/shared/components/card/CardBack'
import { CardFace } from '@/shared/components/card/CardFace'
import { CardFrame } from '@/shared/components/card/CardFrame'
import featured from './featured-cards.json'

/*
 * Cards of the static pages, rendered to HTML at build time (and on each dev request) by the static-cards plugin in vite.config.ts.
 * Same components as the platform, so the markup always matches card.css. Runs in Node only: never imported by the pages.
 * Card data: the card catalog JSON (built from the card CSV). Names to show: featured-cards.json. Images: from the backend.
 */

const catalog = cards as Card[]

function byName(name: string) {
  const card = catalog.find((item) => item.name === name)
  if (!card) throw new Error(`featured-cards.json: no card named "${name}" in the catalog`)
  return card
}

/** The ring of the home page: one <li> per card, the front and the back on the two sides of the slot. */
function ringSlots() {
  const ring = featured.ring.map(byName)
  return (
    <>
      {ring.map((card, index) => (
        <li key={card.id} className="ring-slot" style={{ '--_i': index } as React.CSSProperties}>
          <div className="ring-face ring-front">
            <CardFace card={card} headingLevel={4} sizes="10rem" />
          </div>
          <div className="ring-face ring-back" aria-hidden="true">
            <CardBack />
          </div>
        </li>
      ))}
    </>
  )
}

/** Number shown on a part, matching the legend of the anatomy section. */
function PartNumber({ value }: { value: number }) {
  return (
    <span className="part-number" aria-hidden="true">
      {value}
    </span>
  )
}

/**
 * Anatomy of a card (home page): the card shapes without art, borders in the primary panel colors, a Matte card, one element per part,
 * all direct children of .anatomy-card, so each part can move on its own in 3D (home.css). Decorative: the legend next to it explains.
 */
function anatomyCard() {
  return (
    <div className="game-card anatomy-frame">
      <div className="game-card-face anatomy-card" aria-hidden="true">
        <div className="game-card-art anatomy-art" data-part="art">
          <PartNumber value={2} />
        </div>
        <CardFrame />
        <div className="game-card-name anatomy-name" data-part="name">
          <span className="game-card-title">Card name</span>
          <PartNumber value={1} />
        </div>
        <div className="game-card-panel anatomy-panel">
          <span className="anatomy-text">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="game-card-stat game-card-defense anatomy-stat" data-part="def">
          <ShieldIcon className="game-card-stat-icon" weight="bold" />
          11
          <PartNumber value={4} />
        </div>
        <div className="game-card-stat game-card-attack anatomy-stat" data-part="atk">
          9
          <SwordIcon className="game-card-stat-icon" weight="bold" />
          <PartNumber value={3} />
        </div>
        <div className="anatomy-tag anatomy-faction" data-part="faction">
          <CubeIcon className="game-card-faction-icon" weight="bold" />
          Matte
          <PartNumber value={5} />
        </div>
        <div className="anatomy-tag anatomy-rarity" data-part="rarity">
          Soldier
          <span className="game-card-pips">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <span key={step} className="game-card-pip" data-on={step <= 3 || undefined} />
            ))}
          </span>
          <PartNumber value={6} />
        </div>
      </div>
    </div>
  )
}

const blocks: Record<string, () => React.ReactNode> = { ring: ringSlots, anatomy: anatomyCard }

/** HTML of a block (`<!-- cards:ring -->`). The id prefix keeps the gradient ids unique next to other blocks on the page. */
export function renderCards(block: string) {
  const render = blocks[block]
  if (!render) throw new Error(`Unknown cards block "${block}"`)
  return renderToStaticMarkup(render(), { identifierPrefix: `${block}-` })
}
