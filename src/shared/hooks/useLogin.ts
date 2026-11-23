import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { authService, type PlayerRole } from '@/shared/api/auth'
import { takeNewAccount } from '../newAccount'
import { useApiAction } from './useApiAction'

/**
 * Signs in and returns to the original protected route.
 * firstLoginTo: where the first login of an account just registered on this device goes (the story), instead of the hub.
 */
export function useLogin(requiredRole?: PlayerRole, firstLoginTo?: string) {
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
    if (firstLoginTo && takeNewAccount(result.player.username)) {
      await navigate(firstLoginTo, { replace: true })
      return
    }
    await navigate(target, { replace: true })
  })

  return { login, pending, errorMessage, fieldErrors, roleDenied }
}
