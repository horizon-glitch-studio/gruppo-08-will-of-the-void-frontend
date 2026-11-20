import { ApiPage } from '@/shared/components/ApiPage'
import { shopService } from '../api/shop'

/** Shop screen. */
export function ShopPage() {
  return (
    <ApiPage title="Shop" load={shopService.listPacks}>
      {(packs) => <p>Available packs: {packs.length}</p>}
    </ApiPage>
  )
}
