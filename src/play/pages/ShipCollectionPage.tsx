import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { cardsService } from '@/shared/api/cards'
import { ApiPage } from '@/shared/components/ApiPage'
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

  return (
    <ApiPage title="Collection" load={load}>
      {({ total, deckSize }) => (
        <>
          <p>
            {archive ? 'Archived cards' : 'Owned card types'}: {total}
          </p>
          {deckSize !== undefined && <p>Deck size: {deckSize}</p>}
        </>
      )}
    </ApiPage>
  )
}
