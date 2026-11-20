import { usersService } from '@/shared/api/users'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'

/** Profile screen. */
export function ProfilePage() {
  const { status, data, errorMessage, reload } = useApiQuery(usersService.getMe)

  return (
    <section>
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
