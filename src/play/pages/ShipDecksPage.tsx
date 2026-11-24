import { useState } from 'react'
import { Link } from 'react-router'
import { cardsService } from '@/shared/api/cards'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { decksService } from '../api/decks'
import { paths } from '../routes/paths'

type DeckAction = 'setDefense' | 'removeDefense' | 'remove'

/** Decks screen: the saved decks with their status, defense deck selection and deletion. */
export function ShipDecksPage() {
  const { status, data, errorMessage, reload } = useApiQuery(decksService.list)

  // The deck limit comes from the game rules. If this call fails, the page works without the "x / 20" counter.
  const gameData = useApiQuery(cardsService.getGameData)
  const maxDecks = gameData.status === 'success' ? gameData.data.deckRules.maxSavedDecks : undefined
  const deckSize = gameData.status === 'success' ? gameData.data.deckRules.deckSize : undefined

  // Deletion asks for a second click on the same deck before it happens.
  const [confirmingId, setConfirmingId] = useState<number>()

  const change = useApiAction(async (action: DeckAction, deckId: number) => {
    if (action === 'setDefense') await decksService.setDefense(deckId)
    else if (action === 'removeDefense') await decksService.removeDefense(deckId)
    else await decksService.remove(deckId)
    setConfirmingId(undefined)
    reload()
  })

  const limitReached = maxDecks !== undefined && status === 'success' && data.length >= maxDecks

  return (
    <section>
      <title>Decks – Will of the Void</title>
      <h1>Decks</h1>

      {status === 'loading' && <output>Loading…</output>}

      {/* STYLE: error state with a "Try again" button. */}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {status === 'success' && (
        <>
          {/* STYLE: deck counter and "New deck" action. At the limit the action is replaced by a text,
              because the API refuses a new deck (DECK_LIMIT_REACHED). */}
          <p>{maxDecks !== undefined ? `${data.length} / ${maxDecks} decks` : `${data.length} decks`}</p>
          {limitReached ? <p>You reached the deck limit. Delete a deck to create a new one.</p> : <Link to={paths.deckNew}>New deck</Link>}

          {data.length === 0 && (
            // STYLE: empty state. The text is a placeholder: the Void's voice can be used here.
            // Every Summoner gets a starter deck at registration, so this should rarely appear.
            <p>You have no decks yet.</p>
          )}

          {/* STYLE: list of decks. */}
          <ul>
            {data.map((deck) => (
              <li key={deck.id}>
                {/* STYLE: deck name, linked to the editor. */}
                <Link to={paths.deck(deck.id)}>{deck.name}</Link>
                {/* STYLE: deck status. VALID decks can be played, DRAFT decks cannot (they are saved but break a rule).
                    A deck also becomes DRAFT when a Wanderer in it leaves or a traded card is no longer owned.
                    The look of valid / invalid is up to the PM; it should not rely on color alone. */}
                <p>
                  {deck.status === 'VALID' ? 'Valid' : 'Not valid'} · {deck.totalCards}
                  {deckSize !== undefined ? ` / ${deckSize}` : ''} cards
                </p>
                {/* STYLE: reasons why the deck is not valid. `code` is a raw value from the API (for example a rule name),
                    with the limit and the actual value. TODO: map the codes to readable text once the backend list is confirmed. */}
                {deck.validationErrors.length > 0 && (
                  <ul>
                    {deck.validationErrors.map((error, index) => (
                      <li key={`${error.code}-${index}`}>
                        {error.code}: {error.actual} (limit {error.limit})
                      </li>
                    ))}
                  </ul>
                )}
                {/* STYLE: defense deck badge. The defense deck is the one other Summoners face in Ranked:
                    without a valid one, the Summoner cannot play Ranked. */}
                {deck.isDefenseDeck && <p>Defense deck</p>}
                {/* STYLE: deck actions. All buttons are disabled while one request is running. */}
                <Link to={paths.deck(deck.id)}>Edit</Link>{' '}
                {deck.isDefenseDeck ? (
                  <button type="button" disabled={change.pending} onClick={() => change.run('removeDefense', deck.id)}>
                    Remove as defense deck
                  </button>
                ) : (
                  // The API refuses a deck that is not valid (DEFENSE_DECK_INVALID): the button is disabled to avoid the error.
                  <button type="button" disabled={change.pending || deck.status !== 'VALID'} onClick={() => change.run('setDefense', deck.id)}>
                    Set as defense deck
                  </button>
                )}{' '}
                {confirmingId === deck.id ? (
                  // STYLE: delete confirmation. A modal is also possible: only this block changes.
                  <>
                    <button type="button" disabled={change.pending} onClick={() => change.run('remove', deck.id)}>
                      Confirm delete
                    </button>{' '}
                    <button type="button" onClick={() => setConfirmingId(undefined)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" disabled={change.pending} onClick={() => setConfirmingId(deck.id)}>
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* STYLE: error of the last action. Known API codes such as DEFENSE_DECK_INVALID are not mapped yet in
              src/shared/api/error-message.ts, so the generic message appears. Add them there if the PM wants specific texts. */}
          {change.errorMessage && <ErrorBox message={change.errorMessage} />}

          {/* NOTE: the list reloads from the server after every action, so the page may flash "Loading…" for a moment.
              Updating the list in place (optimistic update) is possible if the PM wants it smoother. */}
          {/* NOTE: not available yet: duplicate a deck. The old design doc asks for it, but the API has no "duplicate" route. */}
        </>
      )}
    </section>
  )
}
