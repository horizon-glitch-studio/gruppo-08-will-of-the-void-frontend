import { ErrorBox } from '@/shared/components/ErrorBox'
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
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}
      {status === 'success' && <p>Available packs: {data.length}</p>}
    </section>
  )
}
