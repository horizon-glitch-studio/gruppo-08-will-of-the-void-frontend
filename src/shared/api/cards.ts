import { apiRequest } from './client'
import { queryString, type ApiId, type PageQuery, type PageResponse } from './queries'

interface Faction {
  id: number
  name: string
  inert: boolean
}

interface Rarity {
  id: number
  name: string
  sortOrder: number
  maxCopiesPerDeck: number
  maxPerDeck: number | null
  durationDays: number | null
  tradeable: boolean
}

export interface Card {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  faction: Faction
  rarity: Rarity
  attack: number
  defense: number
}

interface CardFilters extends PageQuery {
  factionId?: number
  rarityId?: number
  search?: string
  sort?: 'id' | 'name' | 'attack' | 'defense' | 'rarity'
}

interface GameData {
  factions: Faction[]
  rarities: Rarity[]
  advantages: { dominantFactionId: number; dominatedFactionId: number; type: string; value: number }[]
  deckRules: { deckSize: number; maxPerElementalFaction: number; maxSavedDecks: number }
}

/** Public card catalog and game rules. */
export const cardsService = {
  list: (filters: CardFilters = {}, signal?: AbortSignal) => apiRequest<PageResponse<Card>>(`/cards${queryString(filters)}`, { signal }),
  get: (id: ApiId, signal?: AbortSignal) => apiRequest<Card>(`/cards/${encodeURIComponent(id)}`, { signal }),
  getGameData: (signal?: AbortSignal) => apiRequest<GameData>('/game-data', { signal }),
}
