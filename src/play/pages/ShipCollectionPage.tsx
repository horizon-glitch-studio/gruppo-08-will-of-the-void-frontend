import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { cardsService } from '@/shared/api/cards'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { collectionService } from '../api/collection'
import { paths } from '../routes/paths'

const PAGE_SIZE = 20

/** Reads a whole number from the URL. Returns undefined when it is missing or not valid. */
function toInt(value: string | null) {
  if (value === null || value === '') return undefined
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : undefined
}

/** Collection screen: owned cards with filters, and the Archive tab with the Wanderers that left. */
export function ShipCollectionPage() {
  const [params, setParams] = useSearchParams()

  // Everything the user chooses lives in the URL (?tab=archive&factionId=2&rarityId=3&page=1),
  // so a filtered view can be linked, reloaded and reached with the back button.
  const archive = params.get('tab') === 'archive'
  const factionId = toInt(params.get('factionId'))
  const rarityId = toInt(params.get('rarityId'))
  const availableInDeck = params.get('availableInDeck') === 'true'
  // NOTE: assumes the API counts pages from 0. Check it in Swagger (http://localhost:8080/swagger-ui.html);
  // if it counts from 1, change the "page + 1" in the pagination below.
  const page = toInt(params.get('page'))

  /** Changes some URL parameters. A value of undefined removes the parameter. */
  function update(changes: Record<string, string | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined) next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true },
    )
  }

  // Factions and rarities for the filter menus. The same data feeds the card badges later.
  const gameData = useApiQuery(cardsService.getGameData)

  const load = useCallback(
    async (signal: AbortSignal) => {
      if (archive) {
        const result = await collectionService.archive({ page, size: PAGE_SIZE }, signal)
        return { kind: 'archive' as const, result }
      }
      const result = await collectionService.list({ factionId, rarityId, availableInDeck: availableInDeck || undefined, page, size: PAGE_SIZE }, signal)
      return { kind: 'collection' as const, result }
    },
    [archive, factionId, rarityId, availableInDeck, page],
  )
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      <title>Collection – Will of the Void</title>
      <h1>Collection</h1>

      {/* STYLE: tabs "Cards" / "Archive". They are links (not buttons) because the tab is in the URL.
          The active one is marked with aria-current: the PM can style it with [aria-current='page'].
          The Archive is called "memory archive" in the game rules. */}
      <nav aria-label="Collection sections">
        <Link to={{ search: '' }} aria-current={archive ? undefined : 'page'}>
          Cards
        </Link>{' '}
        <Link to={{ search: '?tab=archive' }} aria-current={archive ? 'page' : undefined}>
          Archive
        </Link>
      </nav>

      {/* FILTERS: only on the Cards tab. The Archive endpoint has no filters. */}
      {!archive && (
        // STYLE: filter bar. Each filter writes into the URL and goes back to the first page.
        <form>
          <label>
            Faction{' '}
            <select value={factionId ?? ''} onChange={(event) => update({ factionId: event.target.value || undefined, page: undefined })}>
              <option value="">All factions</option>
              {gameData.status === 'success' &&
                gameData.data.factions.map((faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.name}
                  </option>
                ))}
            </select>
          </label>{' '}
          <label>
            Rarity{' '}
            <select value={rarityId ?? ''} onChange={(event) => update({ rarityId: event.target.value || undefined, page: undefined })}>
              <option value="">All rarities</option>
              {gameData.status === 'success' &&
                gameData.data.rarities.map((rarity) => (
                  <option key={rarity.id} value={rarity.id}>
                    {rarity.name}
                  </option>
                ))}
            </select>
          </label>{' '}
          {/* NOTE: "available in deck" hides cards that cannot be played (for example Wanderers that left).
              It is mostly useful in the deck editor: remove it from here if the PM does not want it on this page. */}
          <label>
            <input type="checkbox" checked={availableInDeck} onChange={(event) => update({ availableInDeck: event.target.checked ? 'true' : undefined, page: undefined })} /> Only cards I can play
          </label>
          {/* NOTE: not available yet, because the API does not support them:
              - search by card name (collection endpoint has no "search", it is gap G13 in docs/frontend-routes-and-api.md);
              - sort by name, rarity, ATK or DEF (the old design doc asked for it);
              - filter by ATK/DEF values.
              If the PM wants them in the design, the backend must add them first. */}
          {(factionId !== undefined || rarityId !== undefined || availableInDeck) && (
            // STYLE: "clear filters" action, shown only when a filter is active.
            <button type="button" onClick={() => update({ factionId: undefined, rarityId: undefined, availableInDeck: undefined, page: undefined })}>
              Clear filters
            </button>
          )}
          {gameData.status === 'error' && (
            // The page still works without the menus: the filters just have no options.
            <p role="alert">Filters could not be loaded.</p>
          )}
        </form>
      )}

      {/* STYLE: loading state. */}
      {status === 'loading' && <output>Loading…</output>}

      {/* STYLE: error state with a "Try again" button (shared ErrorBox component). */}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {status === 'success' && (
        <>
          {/* STYLE: how many cards are shown. `totalItems` counts distinct cards, not copies. */}
          <p>
            {data.result.totalItems} {archive ? 'archived cards' : 'cards'}
          </p>

          {data.result.items.length === 0 && (
            // STYLE: empty state. The text is a placeholder: the Void's voice can be used here.
            // Without filters on the Cards tab this means the Summoner owns nothing, which should not happen (starter deck).
            <p>{archive ? 'No Wanderer has left your Ship yet.' : 'No cards match these filters.'}</p>
          )}

          {/* STYLE: grid of cards. */}
          {data.kind === 'collection' && (
            <ul>
              {data.result.items.map((item) => (
                <li key={item.card.id}>
                  {/* CARD: the PM's card component goes here. Until then, a plain text summary.
                      Data available on `item.card`: id, name, description, imageUrl, faction.name, rarity.name, attack, defense. */}
                  <Link to={paths.collectionCard(item.card.id)}>{item.card.name}</Link>
                  <p>
                    {item.card.faction.name} · {item.card.rarity.name} · ATK {item.card.attack} / DEF {item.card.defense}
                  </p>

                  {/* STYLE: number of copies owned. Shown only when there is more than one. */}
                  {item.quantity > 1 && <p>×{item.quantity}</p>}

                  {/* STYLE: Wanderer time left. `expiresAt` is null for every other rarity.
                      The rules say the time left must always be visible on the card.
                      For now it shows the date it leaves; a countdown ("2 days left") is up to the PM. */}
                  {item.expiresAt && (
                    <p>
                      Leaves on <time dateTime={item.expiresAt}>{new Date(item.expiresAt).toLocaleString()}</time>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* STYLE: Archive tab. Cards are visible but not playable, so there is no link to a detail page. */}
          {data.kind === 'archive' && (
            <ul>
              {data.result.items.map((item) => (
                <li key={item.id}>
                  {/* CARD: same card component as above, in its "not playable" look (the PM decides it). */}
                  <p>{item.card.name}</p>
                  <p>
                    {item.card.faction.name} · {item.card.rarity.name} · ATK {item.card.attack} / DEF {item.card.defense}
                  </p>
                  <p>
                    Arrived <time dateTime={item.arrivedAt}>{new Date(item.arrivedAt).toLocaleDateString()}</time>, left{' '}
                    <time dateTime={item.departedAt}>{new Date(item.departedAt).toLocaleDateString()}</time>
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* NOTE: cards the Summoner does not own yet (shown in grey in the old design doc, to push people to open packs)
              are not here: this endpoint returns only owned cards. To show them, the page would also load the full
              catalog (cardsService.list) and compare. To be decided with the PM and the team. */}

          {/* STYLE: pagination. Page numbers or "Load more" are also possible: only this block changes. */}
          {data.result.totalPages > 1 && (
            <nav aria-label="Pagination">
              <button type="button" disabled={data.result.page <= 0} onClick={() => update({ page: String(data.result.page - 1) })}>
                Previous
              </button>{' '}
              <span>
                Page {data.result.page + 1} of {data.result.totalPages}
              </span>{' '}
              <button type="button" disabled={data.result.page + 1 >= data.result.totalPages} onClick={() => update({ page: String(data.result.page + 1) })}>
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
