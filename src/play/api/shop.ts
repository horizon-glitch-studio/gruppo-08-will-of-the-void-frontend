import type { Card } from '@/shared/api/cards'
import { apiRequest } from '@/shared/api/client'
import { queryString, type ApiId, type PageQuery, type PageResponse } from '@/shared/api/queries'

interface PackRef {
  id: number
  name: string
  kind: string
}

interface Pack extends PackRef {
  shardCost: number
  available: boolean
  availableFrom: string | null
  availableUntil: string | null
  slots: { position: number; odds: { rarityId: number; rarityName: string; probability: number }[] }[]
  guarantees: { type: string; everyPacks: number }[]
  eventCards: Card[]
}

interface Opening {
  id: number
  pack: PackRef
  shardsSpent: number
  guarantee: string | null
  createdAt: string
}

interface ShardTransaction {
  id: number
  amount: number
  reason: string
  packOpeningId: number | null
  invitedPlayerId: number | null
  seasonId: number | null
  orbit: number | null
  createdAt: string
}

const authenticated = true

/** Pack catalog, purchases, opening history, and Shard transactions. */
export const shopService = {
  listPacks: (signal?: AbortSignal) => apiRequest<Pack[]>('/packs', { authenticated, signal }),
  getPack: (id: ApiId, signal?: AbortSignal) => apiRequest<Pack>(`/packs/${encodeURIComponent(id)}`, { authenticated, signal }),
  openPack: (id: ApiId) =>
    apiRequest<Opening & { shardBalance: number; cards: { card: Card; quantity: number; expiresAt: string | null; isNew: boolean }[] }>(`/packs/${encodeURIComponent(id)}/open`, {
      authenticated,
      method: 'POST',
    }),
  listOpenings: (filters: PageQuery = {}, signal?: AbortSignal) =>
    apiRequest<PageResponse<Opening & { totalCards: number }>>(`/users/me/pack-openings${queryString(filters)}`, { authenticated, signal }),
  getOpening: (id: ApiId, signal?: AbortSignal) => apiRequest<Opening & { cards: { card: Card; quantity: number }[] }>(`/users/me/pack-openings/${encodeURIComponent(id)}`, { authenticated, signal }),
  listShardTransactions: (filters: PageQuery = {}, signal?: AbortSignal) =>
    apiRequest<PageResponse<ShardTransaction>>(`/users/me/shard-transactions${queryString(filters)}`, { authenticated, signal }),
}
