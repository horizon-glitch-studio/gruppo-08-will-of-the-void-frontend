import { authService } from '@/shared/api/auth'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiAction } from '@/shared/hooks/useApiAction'

/** Settings screen. */
export function SettingsPage() {
  const { run: logout, pending, errorMessage } = useApiAction(authService.logout)

  return (
    <section>
      <button type="button" onClick={logout} disabled={pending}>
        {pending ? 'Logging out…' : 'Log out'}
      </button>
      {errorMessage && <ErrorBox message={errorMessage} />}
    </section>
  )
}
