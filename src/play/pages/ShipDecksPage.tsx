import { ApiPage } from '@/shared/components/ApiPage'
import { decksService } from '../api/decks'

/** Decks screen. */
export function ShipDecksPage() {
  return (
    <ApiPage title="Decks" load={decksService.list}>
      {(decks) => <p>Saved decks: {decks.length}</p>}
    </ApiPage>
  )
}
