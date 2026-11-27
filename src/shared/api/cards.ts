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
  /** Image path without width and extension, as `/cards/lava/basaltaur`: see cardImage. */
  imageUrl: string | null
  /** What the image shows, for its alt text. Not in the API contract yet: agreed with the backend, null until it is served. */
  imageAlt: string | null
  faction: Faction
  rarity: Rarity
  attack: number
  defense: number
}

export interface CardFilters extends PageQuery {
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

/** Cards from cards.json instead of the API, while the backend has no cards. Loaded only when enabled. */
const mockCards = import.meta.env.VITE_MOCK_CARDS === 'true' ? () => import('./mock/cards') : undefined

/** Public card catalog and game rules. With VITE_MOCK_CARDS=true the catalog comes from the mock; game data always from the API. */
export const cardsService = {
  list: (filters: CardFilters = {}, signal?: AbortSignal) =>
    mockCards ? mockCards().then((mock) => mock.listCards(filters)) : apiRequest<PageResponse<Card>>(`/cards${queryString(filters)}`, { signal }),
  get: (id: ApiId, signal?: AbortSignal) => (mockCards ? mockCards().then((mock) => mock.getCard(id)) : apiRequest<Card>(`/cards/${encodeURIComponent(id)}`, { signal })),
  getGameData: (signal?: AbortSignal) => apiRequest<GameData>('/game-data', { signal }),
}
