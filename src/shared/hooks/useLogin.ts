import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { authService, type PlayerRole } from '@/shared/api/auth'
import { useApiAction } from './useApiAction'

/** Signs in and returns to the original protected route. */
export function useLogin(requiredRole?: PlayerRole) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [roleDenied, setRoleDenied] = useState(false)

  const {
    run: login,
    pending,
    errorMessage,
    fieldErrors,
  } = useApiAction(async (identifier: string, password: string) => {
    setRoleDenied(false)
    const result = await authService.login(identifier, password, requiredRole)
    if (requiredRole && result.player.role !== requiredRole) {
      setRoleDenied(true)
      return
    }

    const returnTo: unknown = state?.returnTo
    const target = typeof returnTo === 'string' && /^\/(?![/\\])/.test(returnTo) ? returnTo : '/'
    await navigate(target, { replace: true })
  })

  return { login, pending, errorMessage, fieldErrors, roleDenied }
}
