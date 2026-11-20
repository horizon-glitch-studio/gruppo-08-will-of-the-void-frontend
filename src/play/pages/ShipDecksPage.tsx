import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { decksService } from '../api/decks'

/** Decks screen. */
export function ShipDecksPage() {
  const { status, data, errorMessage, reload } = useApiQuery(decksService.list)

  return (
    <section>
      <title>Decks – Will of the Void</title>
      <h1>Decks</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && (
        <>
          <p role="alert">{errorMessage}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </>
      )}
      {status === 'success' && <p>Saved decks: {data.length}</p>}
    </section>
  )
}
