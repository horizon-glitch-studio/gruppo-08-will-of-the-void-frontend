import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { authService, type PlayerRole } from '@/shared/api/auth'
import { ApiForm } from './ApiForm'

/** Signs in against the backend and returns the user to the requested route. */
export function LoginForm({ requiredRole }: { requiredRole?: PlayerRole }) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [roleDenied, setRoleDenied] = useState(false)

  return (
    <ApiForm
      label="Log in"
      submit={async (data) => {
        setRoleDenied(false)
        const result = await authService.login(String(data.get('identifier')), String(data.get('password')), requiredRole)
        if (requiredRole && result.player.role !== requiredRole) {
          setRoleDenied(true)
          return
        }
        const returnTo: unknown = state?.returnTo
        const target = typeof returnTo === 'string' && /^\/(?![/\\])/.test(returnTo) ? returnTo : '/'
        await navigate(target, { replace: true })
      }}
    >
      <p>
        <label>
          Username or email <input name="identifier" autoComplete="username" required />
        </label>
      </p>
      <p>
        <label>
          Password <input name="password" type="password" autoComplete="current-password" required />
        </label>
      </p>
      {roleDenied && <p role="alert">An administrator account is required.</p>}
    </ApiForm>
  )
}
