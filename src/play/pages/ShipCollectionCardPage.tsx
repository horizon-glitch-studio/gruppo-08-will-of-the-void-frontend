import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { cardsService } from '@/shared/api/cards'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { collectionService } from '../api/collection'
import { paths } from '../routes/paths'

/** Card screen: one owned card in detail, with its copies and the factions it prevails over or is overpowered by. */
export function ShipCollectionCardPage() {
  const { cardId = '' } = useParams()
  const load = useCallback((signal: AbortSignal) => collectionService.get(cardId, signal), [cardId])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  // Factions and advantages come from the public game rules. If this call fails, the page still shows the card
  // and only the "Strong against / Weak against" block is left out.
  const gameData = useApiQuery(cardsService.getGameData)

  const card = status === 'success' ? data.card : undefined
  const advantages = gameData.status === 'success' ? gameData.data.advantages : []
  const factions = gameData.status === 'success' ? gameData.data.factions : []
  const nameOf = (factionId: number) => factions.find((faction) => faction.id === factionId)?.name ?? ''

  // Inert factions (Gem, Noble Gas) never give or receive an advantage, so both lists are empty for them.
  const prevailsOver = card ? advantages.filter((item) => item.dominantFactionId === card.faction.id).map((item) => nameOf(item.dominatedFactionId)) : []
  const overpoweredBy = card ? advantages.filter((item) => item.dominatedFactionId === card.faction.id).map((item) => nameOf(item.dominantFactionId)) : []

  return (
    <section>
      <title>{card ? `${card.name} – Will of the Void` : 'Card – Will of the Void'}</title>

      {/* STYLE: back link to the collection. */}
      <Link to={paths.collection}>← Collection</Link>

      {status === 'loading' && <output>Loading…</output>}

      {/* STYLE: error state with a "Try again" button. A card the Summoner does not own gives a "could not be found" message. */}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {status === 'success' && (
        <>
          {/* STYLE: card name as page title. */}
          <h1>{data.card.name}</h1>

          {/* CARD: the PM's card component goes here, in its large version.
              Until then, a plain image and text summary.
              Data available on `data.card`: id, name, description, imageUrl, faction.name, rarity.name, attack, defense. */}
          {data.card.imageUrl && (
            // NOTE: `imageUrl` is a relative path. The host that serves the images is still to be confirmed
            // with the backend (gap G12 in docs/frontend-routes-and-api.md), so this image may not load yet.
            <img src={data.card.imageUrl} alt={data.card.name} />
          )}
          <p>
            {data.card.faction.name} · {data.card.rarity.name}
          </p>
          <p>
            ATK {data.card.attack} / DEF {data.card.defense}
          </p>

          {/* STYLE: description text. It can be empty. */}
          {data.card.description && <p>{data.card.description}</p>}

          {/* STYLE: copies owned and the date the card arrived. */}
          <p>
            Copies owned: {data.quantity}
            <br />
            Arrived on <time dateTime={data.acquiredAt}>{new Date(data.acquiredAt).toLocaleDateString()}</time>
          </p>

          {/* STYLE: Wanderer time left. `expiresAt` is null for every other rarity.
              The rules say the time left must always be visible. For now it shows the date it leaves:
              a countdown ("2 days left") is up to the PM. */}
          {data.expiresAt && (
            <p>
              Leaves on <time dateTime={data.expiresAt}>{new Date(data.expiresAt).toLocaleString()}</time>
            </p>
          )}

          {/* STYLE: faction matchups. Only shown for elemental factions. The bonus value (+3 ATK) is still to be
              confirmed by tests in the game rules, so it is not written here. */}
          {(prevailsOver.length > 0 || overpoweredBy.length > 0) && (
            <section aria-label="Faction matchups">
              <h2>Matchups</h2>
              <p>Strong against: {prevailsOver.join(', ')}</p>
              <p>Weak against: {overpoweredBy.join(', ')}</p>
            </section>
          )}

          {/* NOTE: not available yet, because the API does not support it: which of the Summoner's decks contain this card. */}
        </>
      )}
    </section>
  )
}
