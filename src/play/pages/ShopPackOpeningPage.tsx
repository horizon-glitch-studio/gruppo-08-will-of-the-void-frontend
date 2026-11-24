import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { shopService } from '../api/shop'
import { paths } from '../routes/paths'

/** Pack opening screen: the cards found in one pack. The result is loaded by id, so a reload keeps it. */
export function ShopPackOpeningPage() {
  const { openingId = '' } = useParams()
  const load = useCallback((signal: AbortSignal) => shopService.getOpening(openingId, signal), [openingId])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      <title>Pack opening – Will of the Void</title>

      {/* STYLE: back link to the Shop. In the Figma it is a "← Shop" button at the top left. */}
      <Link to={paths.shop}>← Shop</Link>

      {/* STYLE: page title. In the Figma: "Your five creatures" / "Five answers to your call". */}
      <h1>Your five creatures</h1>

      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {status === 'success' && (
        <>
          {/* STYLE: intro text from the Figma, in the Void's voice. */}
          <p>All five drawn cards join your collection. Duplicates remain as copies.</p>

          {/* STYLE: list of the drawn cards, one per slot. The opening animation is up to the PM. */}
          <ol>
            {data.cards.map(({ card, quantity }, index) => (
              <li key={`${card.id}-${index}`}>
                {/* CARD: the PM's card component goes here. Until then, a plain text summary.
                    Data available on `card`: name, imageUrl, faction.name, rarity.name, attack, defense. */}
                <h2>{card.name}</h2>
                <p>
                  {card.faction.name} · {card.rarity.name} · ATK {card.attack} / DEF {card.defense}
                </p>
                {quantity > 1 && <p>×{quantity}</p>}
              </li>
            ))}
          </ol>

          {/* STYLE: the "Open owned packs" and "Buy another" actions are not here yet: they depend on the owned packs decision. */}
        </>
      )}
    </section>
  )
}
