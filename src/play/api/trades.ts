import type { Card } from '@/shared/api/cards'
import { apiRequest } from '@/shared/api/client'
import { queryString, type ApiId, type PageQuery, type PageResponse } from '@/shared/api/queries'
import type { CardQuantity } from './decks'

type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED' | 'FAILED'
type PlayerRef = { id: number; username: string }
type TradeCard = { card: Card; quantity: number }

interface Trade {
  id: number
  status: TradeStatus
  proposer: PlayerRef
  recipient: PlayerRef
  offeredCards: TradeCard[]
  requestedCards: TradeCard[]
  createdAt: string
  expiresAt: string
  closedAt: string | null
}

interface TradeFilters extends PageQuery {
  direction?: 'incoming' | 'outgoing'
  status?: TradeStatus
}

interface TradeProposal {
  recipientUsername: string
  offeredCards: CardQuantity[]
  requestedCards: CardQuantity[]
}

const authenticated = true
const tradePath = (id: ApiId) => `/trades/${encodeURIComponent(id)}` as const

/** Trades between players. */
export const tradesService = {
  list: (filters: TradeFilters = {}, signal?: AbortSignal) => apiRequest<PageResponse<Trade>>(`/trades${queryString(filters)}`, { authenticated, signal }),
  get: (id: ApiId, signal?: AbortSignal) => apiRequest<Trade>(tradePath(id), { authenticated, signal }),
  propose: (json: TradeProposal) => apiRequest<Trade>('/trades', { authenticated, method: 'POST', json }),
  respond: (id: ApiId, action: 'accept' | 'reject' | 'cancel') => apiRequest<Trade>(`${tradePath(id)}/${action}`, { authenticated, method: 'POST' }),
  // The backend does not expose the recipient's collection yet. Never invent a card that could be traded.
  listRecipientCards: (_username: string): Promise<TradeCard[]> => Promise.resolve([]),
}
