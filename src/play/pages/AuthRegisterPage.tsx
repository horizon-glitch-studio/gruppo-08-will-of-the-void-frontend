import { authService } from '@/shared/api/auth'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { markNewAccount } from '@/shared/newAccount'
import { PlayerRegistrationForm } from '../components/PlayerRegistrationForm'

/** Create account screen. */
export function AuthRegisterPage() {
  // The first login of the new account opens the story (see newAccount.ts)
  const { run, pending, errorMessage, fieldErrors, success } = useApiAction(async (...args: Parameters<typeof authService.register>) => {
    const registered = await authService.register(...args)
    markNewAccount(registered.username)
    return registered
  })

  return (
    <>
      <title>Create account – Will of the Void</title>
      <PlayerRegistrationForm register={run} pending={pending} errorMessage={errorMessage} fieldErrors={fieldErrors} success={success} />
    </>
  )
}
