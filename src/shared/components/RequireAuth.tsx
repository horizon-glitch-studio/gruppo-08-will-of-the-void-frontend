import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import type { PlayerRole } from '@/shared/api/auth'
import { ApiError, getSessionVersion, setSession, subscribeToSession } from '@/shared/api/client'
import { apiErrorMessage } from '@/shared/api/error-message'
import { usersService, type CurrentUser } from '@/shared/api/users'
import { CurrentUserContext } from '@/shared/hooks/useCurrentUser'
import { ErrorBox } from './ErrorBox'

/**
 * Blocks protected routes until the API validates the active session and role.
 * Then provides the current player to the routes inside it (useCurrentUser).
 */
export function RequireAuth({ requiredRole }: { requiredRole?: PlayerRole }) {
  const session = useSyncExternalStore(subscribeToSession, getSessionVersion)
  const { pathname, search, hash } = useLocation()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ session: number; attempt: number } & ({ user: CurrentUser } | { error: unknown })>()

  useEffect(() => {
    if (session === null) return
    const controller = new AbortController()
    usersService.getMe(controller.signal).then(
      (user) => {
        if (!controller.signal.aborted) setResult({ session, attempt, user })
      },
      (error: unknown) => {
        if (controller.signal.aborted || session !== getSessionVersion()) return
        if (error instanceof ApiError && (error.status === 401 || error.code === 'PLAYER_NOT_FOUND')) setSession(null)
        else setResult({ session, attempt, error })
      },
    )
    return () => controller.abort()
  }, [session, attempt])

  // Updates the player in place, without showing the session check again
  const reload = useCallback(async () => {
    const user = await usersService.getMe()
    setResult((current) => (current && 'user' in current ? { ...current, user } : current))
  }, [])

  const currentUser = useMemo(() => (result && 'user' in result ? { user: result.user, reload } : null), [result, reload])

  const login = <Navigate to="/login" state={{ returnTo: `${pathname}${search}${hash}` }} replace />

  if (session === null) return login
  if (result?.session !== session || result.attempt !== attempt) return <output>Checking your session…</output>
  if ('error' in result) {
    return (
      <main>
        <ErrorBox message={apiErrorMessage(result.error)} onRetry={() => setAttempt((value) => value + 1)} />
      </main>
    )
  }
  if (requiredRole && result.user.role !== requiredRole) return login

  return (
    <CurrentUserContext value={currentUser}>
      <Outlet key={session} />
    </CurrentUserContext>
  )
}
