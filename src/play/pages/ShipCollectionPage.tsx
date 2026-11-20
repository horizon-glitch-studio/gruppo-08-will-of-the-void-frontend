import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { cardsService } from '@/shared/api/cards'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { collectionService } from '../api/collection'

/** Collection screen. */
export function ShipCollectionPage() {
  const [params] = useSearchParams()
  const archive = params.get('tab') === 'archive'
  const load = useCallback(
    async (signal: AbortSignal) => {
      if (archive) {
        const page = await collectionService.archive({ size: 1 }, signal)
        return { total: page.totalItems }
      }

      const [page, gameData] = await Promise.all([collectionService.list({ size: 1 }, signal), cardsService.getGameData(signal)])
      return { total: page.totalItems, deckSize: gameData.deckRules.deckSize }
    },
    [archive],
  )

  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}
      {status === 'success' && (
        <>
          <p>
            {archive ? 'Archived cards' : 'Owned card types'}: {data.total}
          </p>
          {data.deckSize !== undefined && <p>Deck size: {data.deckSize}</p>}
        </>
      )}
    </section>
  )
}
