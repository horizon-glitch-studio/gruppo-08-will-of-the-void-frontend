import { authService } from '@/shared/api/auth'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { PlayerRegistrationForm } from '../components/PlayerRegistrationForm'

/** Create account screen. */
export function AuthRegisterPage() {
  const { run, pending, errorMessage, fieldErrors, success } = useApiAction(authService.register)

  return (
    <>
      <title>Create account – Will of the Void</title>
      <PlayerRegistrationForm register={run} pending={pending} errorMessage={errorMessage} fieldErrors={fieldErrors} success={success} />
    </>
  )
}
