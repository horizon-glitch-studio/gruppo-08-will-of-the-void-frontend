import { useState } from 'react'
import type { Card } from '@/shared/api/cards'
import cards from '@/shared/api/mock/cards.json'
import { Button } from '@/shared/components/Button'
import { CardBack } from '@/shared/components/card/CardBack'
import { CardFace } from '@/shared/components/card/CardFace'
import { CardFlip } from '@/shared/components/card/CardFlip'
import styles from './DevCardsPage.module.css'

const catalog = cards as Card[]
/** A pack-sized sample for the flip: one card per rarity step up to Elect. */
const pack = ['Sparkit', 'Kobblor', 'Wolfrost', 'Magnetark', 'Adamantis'].map((name) => catalog.find((card) => card.name === name)).filter((card) => card !== undefined)

/** Development only (/play/dev/cards?width=240): front, back and flip of the cards from the mock catalog, at a chosen width. */
export function DevCardsPage() {
  // ?width=300 sets the starting width, to compare sizes or share a view
  const [width, setWidth] = useState(() => Number(new URLSearchParams(location.search).get('width')) || 240)
  const [revealed, setRevealed] = useState(0)
  const grid = { '--_card': `${width}px` } as React.CSSProperties

  return (
    <main className={`container column gap-l ${styles.page}`}>
      <title>Cards preview – Will of the Void</title>
      <h1>Cards preview</h1>
      <label className="row gap-s">
        Card width: {width}px
        <input type="range" min={120} max={480} step={10} value={width} onChange={(event) => setWidth(Number(event.target.value))} />
      </label>

      <section className="column gap-s">
        <h2>Pack opening</h2>
        <div className="row gap-s">
          <Button variant="primary" onClick={() => setRevealed((count) => Math.min(count + 1, pack.length))}>
            Reveal next
          </Button>
          <Button onClick={() => setRevealed(0)}>Reset</Button>
        </div>
        <ul className={styles.grid} style={grid}>
          {pack.map((card, index) => (
            <li key={card.id}>
              <CardFlip revealed={index < revealed}>
                <CardFace card={card} sizes={`${width}px`} loading="eager" />
              </CardFlip>
            </li>
          ))}
        </ul>
      </section>

      <section className="column gap-s">
        <h2>Back</h2>
        <ul className={styles.grid} style={grid}>
          <li>
            <CardBack label="Unrevealed card" />
          </li>
        </ul>
      </section>

      <section className="column gap-s">
        <h2>All cards</h2>
        <ul className={styles.grid} style={grid}>
          {catalog.map((card) => (
            <li key={card.id}>
              <CardFace card={card} sizes={`${width}px`} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
