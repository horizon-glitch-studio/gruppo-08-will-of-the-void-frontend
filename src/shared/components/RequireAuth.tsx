import { useEffect, useState, useSyncExternalStore } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import type { PlayerRole } from '@/shared/api/auth'
import { ApiError, getSessionVersion, setSession, subscribeToSession } from '@/shared/api/client'
import { apiErrorMessage } from '@/shared/api/error-message'
import { usersService, type CurrentUser } from '@/shared/api/users'

/** Blocks protected routes until the API validates the active session and role. */
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

  const login = <Navigate to="/login" state={{ returnTo: `${pathname}${search}${hash}` }} replace />

  if (session === null) return login
  if (result?.session !== session || result.attempt !== attempt) return <output>Checking your session…</output>
  if ('error' in result) {
    return (
      <main>
        <p role="alert">{apiErrorMessage(result.error)}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          Try again
        </button>
      </main>
    )
  }
  if (requiredRole && result.user.role !== requiredRole) return login

  return <Outlet key={session} />
}
