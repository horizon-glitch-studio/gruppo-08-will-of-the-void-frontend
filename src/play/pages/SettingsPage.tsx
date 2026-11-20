import { authService } from '@/shared/api/auth'
import { useApiAction } from '@/shared/hooks/useApiAction'

/** Settings screen. */
export function SettingsPage() {
  const { run: logout, pending, errorMessage } = useApiAction(authService.logout)

  return (
    <section>
      <title>Settings – Will of the Void</title>
      <h1>Settings</h1>
      <button type="button" onClick={logout} disabled={pending}>
        {pending ? 'Logging out…' : 'Log out'}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </section>
  )
}
