import type { Card } from '@/shared/api/cards'
import { apiRequest } from '@/shared/api/client'
import { queryString, type ApiId, type PageQuery, type PageResponse } from '@/shared/api/queries'

interface CollectionItem {
  card: Card
  quantity: number
  acquiredAt: string
  expiresAt: string | null
}

interface ArchiveItem {
  id: number
  card: Card
  arrivedAt: string
  departedAt: string
}

interface CollectionFilters extends PageQuery {
  factionId?: number
  rarityId?: number
  availableInDeck?: boolean
}

const authenticated = true
const list = (filters: CollectionFilters = {}, signal?: AbortSignal) => apiRequest<PageResponse<CollectionItem>>(`/users/me/collection${queryString(filters)}`, { authenticated, signal })

/** Owned cards and the Wanderer archive. */
export const collectionService = {
  list,
  get: (id: ApiId, signal?: AbortSignal) => apiRequest<CollectionItem>(`/users/me/collection/${encodeURIComponent(id)}`, { authenticated, signal }),
  archive: (filters: PageQuery = {}, signal?: AbortSignal) => apiRequest<PageResponse<ArchiveItem>>(`/users/me/archive${queryString(filters)}`, { authenticated, signal }),
}
