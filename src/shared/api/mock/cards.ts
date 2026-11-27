import { ApiError } from '../client'
import type { Card, CardFilters } from '../cards'
import type { ApiId, PageResponse } from '../queries'
import cards from './cards.json'

/*
 * Mock of the public card catalog, used while the backend has no cards (VITE_MOCK_CARDS=true).
 * It answers like CatalogService: active cards only, page from 0, size 1 to 100 (default 20), same filters and sorts.
 * Data: cards.json, built from the card CSV by npm run cards-json.
 */

const catalog = cards as Card[]

const DEFAULT_SIZE = 20
const MAX_SIZE = 100

const sorts: Record<NonNullable<CardFilters['sort']>, (a: Card, b: Card) => number> = {
  id: (a, b) => a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
  attack: (a, b) => b.attack - a.attack || a.id - b.id,
  defense: (a, b) => b.defense - a.defense || a.id - b.id,
  rarity: (a, b) => a.rarity.sortOrder - b.rarity.sortOrder || a.id - b.id,
}

function validation(field: string, code: string) {
  return new ApiError(400, { code: 'VALIDATION_FAILED', fieldErrors: [{ field, code }] })
}

/** A page of the catalog, filtered and sorted as GET /cards. */
export function listCards({ factionId, rarityId, search, sort = 'id', page = 0, size = DEFAULT_SIZE }: CardFilters = {}): Promise<PageResponse<Card>> {
  if (!(sort in sorts)) return Promise.reject(validation('sort', 'SORT_INVALID'))
  if (page < 0) return Promise.reject(validation('page', 'PAGE_INVALID'))
  if (size < 1 || size > MAX_SIZE) return Promise.reject(validation('size', 'SIZE_INVALID'))

  const term = search?.trim().toLowerCase()
  const matches = catalog
    .filter((card) => (factionId === undefined || card.faction.id === factionId) && (rarityId === undefined || card.rarity.id === rarityId) && (!term || card.name.toLowerCase().includes(term)))
    .sort(sorts[sort])

  return Promise.resolve({
    items: matches.slice(page * size, (page + 1) * size),
    page,
    size,
    totalItems: matches.length,
    totalPages: Math.ceil(matches.length / size),
  })
}

/** One card, as GET /cards/{cardId}: 404 CARD_NOT_FOUND when missing. */
export function getCard(id: ApiId): Promise<Card> {
  const card = catalog.find((item) => item.id === Number(id))
  return card ? Promise.resolve(card) : Promise.reject(new ApiError(404, { code: 'CARD_NOT_FOUND' }))
}
