import { useNavigate } from 'react-router'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { shopService } from '../api/shop'
import { paths } from '../routes/paths'

/** Probability as a percentage. Assumes the API sends a fraction (0.7 = 70%): check it in Swagger. */
function formatOdds(probability: number) {
  return `${Number((probability * 100).toFixed(1))}%`
}

/** Shop screen: packs on sale. Buying a pack opens it at once and shows the result. */
export function ShopPage() {
  const navigate = useNavigate()
  const { status, data, errorMessage, reload } = useApiQuery(shopService.listPacks)

  // Buy and open in one step: the API has no "owned packs" yet, so after the purchase
  // we go straight to the opening screen (/shop/openings/:id).
  const buy = useApiAction(async (packId: number) => {
    const opening = await shopService.openPack(packId)
    await navigate(paths.shopOpening(opening.id))
  })

  return (
    <section>
      <title>Shop – Will of the Void</title>
      <h1>Shop</h1>

      {/* STYLE: loading state. */}
      {status === 'loading' && <output>Loading…</output>}

      {/* STYLE: error state with a "Try again" button (shared ErrorBox component). */}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {/* STYLE: layout of the pack list. For now each pack is a plain <article>.
          The PM decides if it becomes a reusable card component. */}
      {status === 'success' &&
        data.map((pack) => (
          <article key={pack.id}>
            <h2>{pack.name}</h2>

            {/* STYLE: price line. In the Figma it reads "5 cards · 300 Shards". */}
            <p>
              {pack.slots.length} cards · {pack.shardCost} Shards
            </p>

            {/* Event pack only: end date and Wanderer cards. Not in the Figma, remove if not wanted. */}
            {pack.availableUntil && <p>Available until {new Date(pack.availableUntil).toLocaleDateString()}</p>}
            {pack.eventCards.length > 0 && <p>Wanderers: {pack.eventCards.map((card) => card.name).join(', ')}</p>}

            {/* STYLE: primary button. Disabled while a purchase is running or when the pack is not on sale. */}
            <button type="button" onClick={() => buy.run(pack.id)} disabled={buy.pending || !pack.available}>
              {pack.available ? `Buy · ${pack.shardCost} Shards` : 'Not available'}
            </button>

            {/* STYLE: drop rates are a collapsible block for now. In the Figma they are a separate screen
                ("Standard drop rates" / "Event drop rates"): if the PM prefers a panel or a page, only this block moves. */}
            <details>
              <summary>Drop rates</summary>
              <dl>
                {pack.slots.map((slot) => (
                  <div key={slot.position}>
                    <dt>Slot {slot.position}</dt>
                    <dd>{slot.odds.map((odds) => `${odds.rarityName} ${formatOdds(odds.probability)}`).join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </details>

            {/* Same as above: the Figma has a separate "Pack guarantees" screen. Raw `type` values from the API for now. */}
            {pack.guarantees.length > 0 && (
              <details>
                <summary>Guarantees</summary>
                <ul>
                  {pack.guarantees.map((guarantee) => (
                    <li key={guarantee.type}>
                      {guarantee.type}: within {guarantee.everyPacks} packs
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}

      {/* STYLE: purchase error. TODO: "The Void asks for 300 Shards" screen from the Figma, needs the INSUFFICIENT_SHARDS error code. */}
      {buy.errorMessage && <ErrorBox message={buy.errorMessage} />}
    </section>
  )
}
