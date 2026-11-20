import { createContext, useContext } from 'react'
import type { CurrentUser } from '@/shared/api/users'

/** Current player and a way to reload it, provided by RequireAuth. */
export interface CurrentUserValue {
  user: CurrentUser
  /** Reloads the player from the API, for example after a purchase changes the Shard balance. */
  reload: () => Promise<void>
}

/** Filled by RequireAuth once the session is validated. */
export const CurrentUserContext = createContext<CurrentUserValue | null>(null)

/** Current player. Only inside routes protected by RequireAuth. */
export function useCurrentUser(): CurrentUserValue {
  const value = useContext(CurrentUserContext)
  if (!value) throw new Error('useCurrentUser must be used inside a route protected by RequireAuth')
  return value
}
