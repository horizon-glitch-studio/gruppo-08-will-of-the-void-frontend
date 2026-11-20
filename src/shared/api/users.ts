import type { PlayerRole } from './auth'
import { apiRequest, setSession } from './client'

interface PublicProfile {
  id: number
  username: string
  avatar: string | null
  trophies: number
  league: string
  stats: { matchesPlayed: number; wins: number; losses: number; draws: number; winRate: number }
  createdAt: string
}

export interface CurrentUser extends PublicProfile {
  email: string
  emailVerified: boolean
  role: PlayerRole
  shardBalance: number
  defenseDeckId: number | null
  protectedUntil: string | null
  timezone: string
  inviteCode: string
  invitedBy: string | null
}

interface Settings {
  reduceMotion: boolean
  reduceTransparency: boolean
  showTextLabels: boolean
}

const authenticated = true

/** Player profiles and preferences. */
export const usersService = {
  getMe: (signal?: AbortSignal) => apiRequest<CurrentUser>('/users/me', { authenticated, signal }),
  getPublic: (username: string, signal?: AbortSignal) => apiRequest<PublicProfile>(`/users/${encodeURIComponent(username)}`, { signal }),
  updateMe: (json: { avatar?: string; timezone?: string }) => apiRequest<CurrentUser>('/users/me', { authenticated, method: 'PATCH', json }),
  getSettings: (signal?: AbortSignal) => apiRequest<Settings>('/users/me/settings', { authenticated, signal }),
  updateSettings: (json: Partial<Settings>) => apiRequest<Settings>('/users/me/settings', { authenticated, method: 'PATCH', json }),
  changePassword: (currentPassword: string, newPassword: string) => apiRequest<void>('/users/me/password', { authenticated, method: 'PUT', json: { currentPassword, newPassword } }),
  async deleteAccount(password: string) {
    await apiRequest<void>('/users/me', { authenticated, method: 'DELETE', json: { password } })
    setSession(null)
  },
}
