import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { shopService } from '../api/shop'

/** Shop screen. */
export function ShopPage() {
  const { status, data, errorMessage, reload } = useApiQuery(shopService.listPacks)

  return (
    <section>
      <title>Shop – Will of the Void</title>
      <h1>Shop</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && (
        <>
          <p role="alert">{errorMessage}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </>
      )}
      {status === 'success' && <p>Available packs: {data.length}</p>}
    </section>
  )
}
