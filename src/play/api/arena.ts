import { apiRequest } from '@/shared/api/client'
import { queryString, type ApiId, type PageQuery, type PageResponse } from '@/shared/api/queries'
import type { Orbit } from '@/shared/orbits'

type MatchmakingMode = 'QUICK' | 'RANKED'
type BattleMode = 'FRIEND' | MatchmakingMode
type BattleStatus = 'PENDING' | 'REJECTED' | 'EXPIRED' | 'CANCELLED' | 'PLAYED'
type BattleOutcome = 'CHALLENGER_WIN' | 'OPPONENT_WIN' | 'DRAW'
type PlayerRef = { id: number; username: string }

interface Battle {
  id: number
  mode: BattleMode
  status: BattleStatus
  challenger: PlayerRef
  opponent: PlayerRef
  outcome: BattleOutcome | null
  challengerEnergy: number | null
  opponentEnergy: number | null
  challengerTrophiesDelta: number | null
  opponentTrophiesDelta: number | null
  createdAt: string
  expiresAt: string | null
  playedAt: string | null
  rematchOfId: number | null
}

interface BattleFilters extends PageQuery {
  mode?: BattleMode
  status?: BattleStatus
  result?: 'WIN' | 'LOSS' | 'DRAW'
  from?: string
  to?: string
}

interface BattleResult {
  battleId: number
  mode: BattleMode
  outcome: BattleOutcome
  endReason: string | null
  winThreshold: number
  challenger: { player: PlayerRef; energy: number; trophiesDelta: number | null }
  opponent: { player: PlayerRef; energy: number; trophiesDelta: number | null }
  playedAt: string
}

interface Replay {
  battleId: number
  schemaVersion: string | number
  mode: BattleMode
  players: { playerId: number; side: string; displayName: string; deckSnapshot: unknown }[]
  events: Record<string, unknown>[]
  rules: { energyWinThreshold: number; endBonusPerCard: number }
  result: { endReason: string; winnerSide: string | null; finalEnergyBySide: Record<string, number> }
}

interface OpponentList {
  mode: MatchmakingMode
  generatedAt: string
  refreshAvailableAt: string
  opponents: { position: number; opponent: PlayerRef; trophiesAtGeneration: number; orbit: Orbit; attacked: boolean; battleId: number | null }[]
}

/** A row of the current-season leaderboard. avatar is the avatar key, as in the player profile. */
export interface LeaderboardEntry {
  position: number
  id: number
  username: string
  avatar: string | null
  trophies: number
  orbit: Orbit
}

interface LeaderboardFilters extends PageQuery {
  orbit?: Orbit
}

/** The Ranked season in progress. Dates are ISO 8601 instants. */
export interface Season {
  id: number
  startsAt: string
  endsAt: string
}

const authenticated = true
const battlePath = (id: ApiId) => `/battles/${encodeURIComponent(id)}` as const
const opponentsPath = '/matchmaking/opponents'

/** Battle history, challenges, replays, opponent matchmaking, leaderboard and season. */
export const arenaService = {
  history: (filters: BattleFilters = {}, signal?: AbortSignal) => apiRequest<PageResponse<Battle>>(`/users/me/battles${queryString(filters)}`, { authenticated, signal }),
  get: (id: ApiId, signal?: AbortSignal) => apiRequest<Battle>(battlePath(id), { authenticated, signal }),
  result: (id: ApiId, signal?: AbortSignal) => apiRequest<BattleResult>(`${battlePath(id)}/result`, { authenticated, signal }),
  replay: (id: ApiId, signal?: AbortSignal) => apiRequest<Replay>(`${battlePath(id)}/replay`, { authenticated, signal }),
  challengeFriend: (opponentUsername: string, deckId: number) => apiRequest<Battle>('/battles/friend', { authenticated, method: 'POST', json: { opponentUsername, deckId } }),
  accept: (id: ApiId, deckId: number) => apiRequest<Battle>(`${battlePath(id)}/accept`, { authenticated, method: 'POST', json: { deckId } }),
  decline: (id: ApiId, action: 'reject' | 'cancel') => apiRequest<Battle>(`${battlePath(id)}/${action}`, { authenticated, method: 'POST' }),
  rematch: (id: ApiId, deckId: number) => apiRequest<Battle>(`${battlePath(id)}/rematch`, { authenticated, method: 'POST', json: { deckId } }),
  listOpponents: (mode: MatchmakingMode, signal?: AbortSignal) => apiRequest<OpponentList>(`${opponentsPath}${queryString({ mode })}`, { authenticated, signal }),
  refreshOpponents: (mode: MatchmakingMode) => apiRequest<OpponentList>(`${opponentsPath}/refresh`, { authenticated, method: 'POST', json: { mode } }),
  attack: (id: ApiId, mode: MatchmakingMode, deckId: number) => apiRequest<Battle>(`${opponentsPath}/${encodeURIComponent(id)}/battle`, { authenticated, method: 'POST', json: { mode, deckId } }),
  /** Current season only, and only players with at least one Ranked battle in it. */
  leaderboard: (filters: LeaderboardFilters = {}, signal?: AbortSignal) => apiRequest<PageResponse<LeaderboardEntry>>(`/leaderboard${queryString(filters)}`, { authenticated, signal }),
  currentSeason: (signal?: AbortSignal) => apiRequest<Season>('/seasons/current', { authenticated, signal }),
}
