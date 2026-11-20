import { ApiError } from '@/shared/api/client'
import { usersService } from '@/shared/api/users'

interface Friend {
  id: number
  username: string
  online: boolean
}

interface Notification {
  id: number
  type: string
  isRead: boolean
}

/** Public profiles and previews for the social features without backend routes. */
export const communityService = {
  getSummoner: usersService.getPublic,
  // The partial search endpoint is pending. Use the real exact-username lookup.
  async searchSummoners(username: string, signal?: AbortSignal) {
    if (!username) return []
    try {
      return [await usersService.getPublic(username, signal)]
    } catch (error) {
      if (error instanceof ApiError && error.status === 404 && error.code === 'PLAYER_NOT_FOUND') return []
      throw error
    }
  },
  // Friendships and notifications have no backend controllers yet.
  listFriends: (): Promise<Friend[]> => Promise.resolve([]),
  listFriendRequests: (): Promise<Friend[]> => Promise.resolve([]),
  listNotifications: (): Promise<Notification[]> => Promise.resolve([]),
  unreadCount: (): Promise<{ count: number }> => Promise.resolve({ count: 0 }),
}
