import { useCallback } from 'react'
import { useParams } from 'react-router'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { shopService } from '../api/shop'

/** Pack opening screen: the cards found in one pack. The result is loaded by id, so a reload keeps it. */
export function ShopPackOpeningPage() {
  const { openingId = '' } = useParams()
  const load = useCallback((signal: AbortSignal) => shopService.getOpening(openingId, signal), [openingId])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {status === 'success' && (
        <>
          {/* STYLE: intro text from the Figma ("Five answers to your call"), in the Void's voice. */}
          <p>All five drawn cards join your collection. Duplicates remain as copies.</p>

          {/* STYLE: list of the drawn cards, one per slot. The opening animation is up to the PM.
              NOTE: the list is an <ol> because the order of the slots matters, but the API does not return the slot number,
              so "Slot 1, Slot 2..." from the Figma can only be shown from the position in the list. */}
          <ol>
            {data.cards.map(({ card, quantity }, index) => (
              <li key={`${card.id}-${index}`}>
                {/* NOTE: this endpoint does not return `isNew` (badge "New") or `expiresAt` (time left of a Wanderer).
                    They are only in the response of the purchase. To show them, the backend must add them here,
                    or the purchase response must be passed to this page through the router state. */}
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

          {/* NOTE: the buttons "Open owned packs" and "Buy another" from the Figma are not here yet:
              they depend on the owned packs decision with the backend. */}
        </>
      )}
    </section>
  )
}
