import { authService } from '@/shared/api/auth'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { adminCardsService } from '../api/cards'

/** Cards screen of the backoffice. */
export function CardsPage() {
  const { status, data: cards, errorMessage, reload } = useApiQuery(adminCardsService.list)
  const logout = useApiAction(authService.logout)

  return (
    <section>
      <title>Cards – Will of the Void admin</title>
      <h1>Cards</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && (
        <>
          <p role="alert">{errorMessage}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </>
      )}
      {status === 'success' && <p>Catalog preview: {cards.map(({ name }) => name).join(', ')}</p>}
      <button type="button" onClick={logout.run} disabled={logout.pending}>
        {logout.pending ? 'Logging out…' : 'Log out'}
      </button>
      {logout.errorMessage && <p role="alert">{logout.errorMessage}</p>}
    </section>
  )
}
