import { usersService } from '@/shared/api/users'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'

/** Profile screen. */
export function ProfilePage() {
  const { status, data, errorMessage, reload } = useApiQuery(usersService.getMe)

  return (
    <section>
      <title>Profile – Will of the Void</title>
      <h1>Profile</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}
      {status === 'success' && (
        <p>
          {data.username} · {data.trophies} trophies
        </p>
      )}
    </section>
  )
}
