import { ErrorBox } from '@/shared/components/ErrorBox'
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
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}
      {status === 'success' && <p>Saved decks: {data.length}</p>}
    </section>
  )
}
