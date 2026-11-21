import { useSearchParams } from 'react-router'

/**
 * The deck chosen for a match, kept in the address as ?deck=<id>.
 * It survives a page reload and the back button, and the Arena links pass it on to the mode screens.
 * Returns the id from the address (undefined if missing or not a number) and a setter that replaces the history entry.
 */
export function useDeckParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = Number(searchParams.get('deck'))
  const deckId = Number.isInteger(raw) && raw > 0 ? raw : undefined

  function setDeckId(id: number) {
    setSearchParams(
      (params) => {
        params.set('deck', String(id))
        return params
      },
      { replace: true },
    )
  }

  return [deckId, setDeckId] as const
}

/** Path of a mode screen with the chosen deck in the address. */
export function withDeck(path: string, deckId: number | undefined) {
  return deckId === undefined ? path : `${path}?deck=${deckId}`
}
