import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { cardsService, type Card } from '@/shared/api/cards'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { collectionService } from '../api/collection'
import { decksService } from '../api/decks'
import { paths } from '../routes/paths'

type OwnedItem = Awaited<ReturnType<typeof collectionService.list>>['items'][number]

/** Loads every playable card of the collection, page by page (the API allows at most 100 per page). */
async function loadAllOwned(signal: AbortSignal) {
  const items: OwnedItem[] = []
  let page = 0
  let totalPages = 1
  while (page < totalPages) {
    const result = await collectionService.list({ availableInDeck: true, page, size: 100 }, signal)
    items.push(...result.items)
    totalPages = result.totalPages
    page++
  }
  return items
}

/** Everything the editor needs: playable cards, the deck being edited (none for a new deck) and the game rules. */
async function loadEditorData(deckId: string | undefined, signal: AbortSignal) {
  const [owned, deck, gameData] = await Promise.all([loadAllOwned(signal), deckId ? decksService.get(deckId, signal) : Promise.resolve(undefined), cardsService.getGameData(signal)])
  return { owned, deck, gameData }
}

type EditorData = Awaited<ReturnType<typeof loadEditorData>>

/** Deck editor screen: create a new deck or edit a saved one. Route /ship/decks/new or /ship/decks/:deckId. */
export function ShipDeckEditorPage() {
  const { deckId } = useParams()
  const load = useCallback((signal: AbortSignal) => loadEditorData(deckId, signal), [deckId])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      {status === 'loading' && <output>Loading…</output>}

      {/* STYLE: error state with a "Try again" button. A deck that does not exist gives a "could not be found" message. */}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {/* The editor starts from the loaded data. `key` makes it start again when the route changes (new deck <-> saved deck). */}
      {status === 'success' && <DeckEditor key={deckId ?? 'new'} {...data} />}
    </section>
  )
}

/** The editor itself: name, cards in the deck, collection to add from, live checks and save. */
function DeckEditor({ owned, deck, gameData }: EditorData) {
  const navigate = useNavigate()
  const [name, setName] = useState(deck?.name ?? '')
  // Cards in the deck: card id -> copies.
  const [quantities, setQuantities] = useState<Record<number, number>>(() => Object.fromEntries((deck?.cards ?? []).map(({ card, quantity }) => [card.id, quantity])))
  const [factionFilter, setFactionFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [validation, setValidation] = useState<Awaited<ReturnType<typeof decksService.validate>>>()

  const { deckRules } = gameData
  const cards = useMemo(() => Object.entries(quantities).map(([id, quantity]) => ({ cardId: Number(id), quantity })), [quantities])
  const total = cards.reduce((sum, item) => sum + item.quantity, 0)

  // Card details by id. Cards of a saved deck that can no longer be played (for example a Wanderer that left)
  // are not in the collection list, but they must still be shown so they can be removed.
  const cardsById = useMemo(() => {
    const map = new Map<number, Card>()
    for (const { card } of owned) map.set(card.id, card)
    for (const { card } of deck?.cards ?? []) map.set(card.id, card)
    return map
  }, [owned, deck])

  // Live check with the server rules, a moment after the last change. If it fails the editor still works:
  // the server checks again when the deck is saved.
  useEffect(() => {
    if (cards.length === 0) return
    let cancelled = false
    const timer = setTimeout(() => {
      decksService.validate(cards).then(
        (result) => {
          if (!cancelled) setValidation(result)
        },
        () => {
          if (!cancelled) setValidation(undefined)
        },
      )
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [cards])

  const counters = useMemo(() => {
    const factions = new Map<number, { name: string; count: number; limit?: number }>()
    const rarities = new Map<number, { name: string; count: number; limit?: number }>()
    for (const [id, quantity] of Object.entries(quantities)) {
      const card = cardsById.get(Number(id))
      if (!card) continue
      const faction = factions.get(card.faction.id) ?? { name: card.faction.name, count: 0, limit: card.faction.inert ? undefined : deckRules.maxPerElementalFaction }
      faction.count += quantity
      factions.set(card.faction.id, faction)
      const rarity = rarities.get(card.rarity.id) ?? { name: card.rarity.name, count: 0, limit: card.rarity.maxPerDeck ?? undefined }
      rarity.count += quantity
      rarities.set(card.rarity.id, rarity)
    }
    return { factions: [...factions.values()], rarities: [...rarities.values()] }
  }, [quantities, cardsById, deckRules.maxPerElementalFaction])

  const inDeck = Object.entries(quantities)
    .flatMap(([id, quantity]) => {
      const card = cardsById.get(Number(id))
      return card ? [{ card, quantity }] : []
    })
    .sort((a, b) => a.card.name.localeCompare(b.card.name))

  const visibleOwned = owned.filter((item) => (factionFilter === '' || String(item.card.faction.id) === factionFilter) && (rarityFilter === '' || String(item.card.rarity.id) === rarityFilter))

  function setCopies(cardId: number, copies: number) {
    setQuantities((previous) => {
      const next = { ...previous }
      if (copies <= 0) delete next[cardId]
      else next[cardId] = copies
      return next
    })
  }

  const save = useApiAction(async () => {
    const draft = { name: name.trim(), cards }
    if (deck) await decksService.update(deck.id, draft)
    else await decksService.create(draft)
    await navigate(paths.decks)
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void save.run()
  }

  return (
    <form onSubmit={submit}>
      {/* STYLE: deck name field. The header shows "New deck" from the route meta: for a saved deck,
          the PM can decide to show its name there. */}
      <p>
        <label>
          Deck name <input name="name" value={name} onChange={(event) => setName(event.target.value)} required aria-invalid={!!save.fieldErrors.name} />
        </label>
      </p>
      {save.fieldErrors.name && <p role="alert">{save.fieldErrors.name}</p>}

      {/* STYLE: live counters. The rules: exactly {deckSize} cards, a limit of copies per faction and per rarity.
          They are also checked by the server, here they only help while building. */}
      <section aria-label="Deck summary">
        <h2>
          Your deck: {total} / {deckRules.deckSize} cards
        </h2>
        <ul>
          {counters.factions.map((item) => (
            <li key={item.name}>
              {item.name}: {item.count}
              {item.limit !== undefined ? ` / ${item.limit}` : ''}
            </li>
          ))}
        </ul>
        <ul>
          {counters.rarities.map((item) => (
            <li key={item.name}>
              {item.name}: {item.count}
              {item.limit !== undefined ? ` / ${item.limit}` : ''}
            </li>
          ))}
        </ul>

        {/* STYLE: result of the live check. The API sends INCOMPLETE, VALID or INVALID: only VALID decks can be played,
            but any deck can be saved. `code` is a raw value from the API, with the limit and the actual value.
            TODO: map the codes to readable text once the backend list is confirmed. Not shown for an empty deck. */}
        {total > 0 && validation && (
          <>
            <output>{validation.status === 'VALID' ? 'This deck is valid.' : 'This deck is not valid yet.'}</output>{' '}
            <ul>
              {validation.validationErrors.map((error, index) => (
                <li key={`${error.code}-${index}`}>
                  {error.code}: {error.actual} (limit {error.limit})
                </li>
              ))}
            </ul>
            )
          </>
        )}

        {/* STYLE: list of the cards in the deck, with a button to remove one copy. */}
        {inDeck.length === 0 ? (
          // STYLE: empty state. The text is a placeholder.
          <p>Add cards from your collection.</p>
        ) : (
          <ul>
            {inDeck.map(({ card, quantity }) => (
              <li key={card.id}>
                {/* CARD: the PM's card component goes here (small version). Until then, a plain text summary. */}
                {card.name} · {card.faction.name} · {card.rarity.name} · ATK {card.attack} / DEF {card.defense} · ×{quantity}{' '}
                <button type="button" onClick={() => setCopies(card.id, quantity - 1)}>
                  Remove one
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* STYLE: collection to add cards from, with filters. In the old design doc it is on the left and the deck on the right.
          Adding by drag and drop (also in the old doc) is not done: buttons work with keyboard and screen readers.
          NOTE: search by card name is not available because the collection endpoint has no "search" (gap G13). */}
      <section aria-label="Collection">
        <h2>Collection</h2>
        <label>
          Faction{' '}
          <select value={factionFilter} onChange={(event) => setFactionFilter(event.target.value)}>
            <option value="">All factions</option>
            {gameData.factions.map((faction) => (
              <option key={faction.id} value={faction.id}>
                {faction.name}
              </option>
            ))}
          </select>
        </label>{' '}
        <label>
          Rarity{' '}
          <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
            <option value="">All rarities</option>
            {gameData.rarities.map((rarity) => (
              <option key={rarity.id} value={rarity.id}>
                {rarity.name}
              </option>
            ))}
          </select>
        </label>
        {visibleOwned.length === 0 && <p>No cards match these filters.</p>}
        <ul>
          {visibleOwned.map((item) => {
            const copies = quantities[item.card.id] ?? 0
            // A deck cannot hold more copies than the Summoner owns, nor more than the rarity allows.
            const maxCopies = Math.min(item.quantity, item.card.rarity.maxCopiesPerDeck)
            return (
              <li key={item.card.id}>
                {/* CARD: the PM's card component goes here. Until then, a plain text summary. */}
                {item.card.name} · {item.card.faction.name} · {item.card.rarity.name} · ATK {item.card.attack} / DEF {item.card.defense} · owned ×{item.quantity} · in deck {copies} / {maxCopies}{' '}
                <button type="button" disabled={copies >= maxCopies} onClick={() => setCopies(item.card.id, copies + 1)}>
                  Add
                </button>
              </li>
            )
          })}
        </ul>
        {/* NOTE: all playable cards are loaded at once (up to 100 per request, several requests if needed).
            For very large collections the PM may want a paginated or "load more" list. */}
      </section>

      {/* STYLE: save button. A deck that is not valid can be saved as a draft, but it cannot be played. */}
      <button type="submit" disabled={save.pending}>
        {save.pending ? 'Saving…' : 'Save deck'}
      </button>
      {save.errorMessage && <ErrorBox message={save.errorMessage} />}
    </form>
  )
}
