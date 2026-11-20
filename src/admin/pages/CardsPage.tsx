import { authService } from '@/shared/api/auth'
import { ApiForm } from '@/shared/components/ApiForm'
import { ApiPage } from '@/shared/components/ApiPage'
import { adminCardsService } from '../api/cards'

/** Cards screen of the backoffice. */
export function CardsPage() {
  return (
    <ApiPage title="Cards" load={adminCardsService.list}>
      {(cards) => (
        <>
          <p>Catalog preview: {cards.map(({ name }) => name).join(', ')}</p>
          <ApiForm label="Log out" submit={authService.logout} />
        </>
      )}
    </ApiPage>
  )
}
