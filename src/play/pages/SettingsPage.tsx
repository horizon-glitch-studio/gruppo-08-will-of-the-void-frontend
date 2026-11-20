import { authService } from '@/shared/api/auth'
import { ApiForm } from '@/shared/components/ApiForm'

/** Settings screen. */
export function SettingsPage() {
  return (
    <section>
      <title>Settings – Will of the Void</title>
      <h1>Settings</h1>
      <ApiForm label="Log out" submit={authService.logout} />
    </section>
  )
}
