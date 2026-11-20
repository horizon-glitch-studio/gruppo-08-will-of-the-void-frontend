import type { Card } from '@/shared/api/cards'
import { apiRequest } from '@/shared/api/client'
import type { ApiId } from '@/shared/api/queries'

export interface CardQuantity {
  cardId: number
  quantity: number
}

interface DeckDraft {
  name: string
  cards: CardQuantity[]
}

interface Validation {
  status: 'VALID' | 'DRAFT'
  totalCards: number
  validationErrors: { code: string; cardId: number | null; rarityId: number | null; factionId: number | null; limit: number; actual: number }[]
}

interface Deck extends Validation {
  id: number
  name: string
  cards: { card: Card; quantity: number }[]
  isDefenseDeck: boolean
  updatedAt: string
}

const authenticated = true
const deckPath = (id: ApiId) => `/users/me/decks/${encodeURIComponent(id)}` as const

/** Saved decks, deck composition validation, and defense deck selection. */
export const decksService = {
  list: (signal?: AbortSignal) => apiRequest<Deck[]>('/users/me/decks', { authenticated, signal }),
  get: (id: ApiId, signal?: AbortSignal) => apiRequest<Deck>(deckPath(id), { authenticated, signal }),
  create: (json: DeckDraft) => apiRequest<Deck>('/users/me/decks', { authenticated, method: 'POST', json }),
  update: (id: ApiId, json: DeckDraft) => apiRequest<Deck>(deckPath(id), { authenticated, method: 'PUT', json }),
  validate: (cards: CardQuantity[]) => apiRequest<Validation>('/users/me/decks/validate', { authenticated, method: 'POST', json: { cards } }),
  remove: (id: ApiId) => apiRequest<void>(deckPath(id), { authenticated, method: 'DELETE' }),
  setDefense: (id: ApiId) => apiRequest<Deck>(`${deckPath(id)}/defense`, { authenticated, method: 'PUT' }),
  removeDefense: (id: ApiId) => apiRequest<void>(`${deckPath(id)}/defense`, { authenticated, method: 'DELETE' }),
}
