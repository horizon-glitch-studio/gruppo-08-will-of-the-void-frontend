import { useLogin } from '@/shared/hooks/useLogin'
import { PlayerLoginForm } from '../components/PlayerLoginForm'

/** Log in screen. */
export function AuthLoginPage() {
  const { login, pending, errorMessage, fieldErrors } = useLogin()

  return (
    <>
      <title>Log in – Will of the Void</title>
      <PlayerLoginForm login={login} pending={pending} errorMessage={errorMessage} fieldErrors={fieldErrors} />
    </>
  )
}
