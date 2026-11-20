import { usersService } from '@/shared/api/users'
import { useApiQuery } from '@/shared/hooks/useApiQuery'

/** Profile screen. */
export function ProfilePage() {
  const { status, data, errorMessage, reload } = useApiQuery(usersService.getMe)

  return (
    <section>
      <title>Profile – Will of the Void</title>
      <h1>Profile</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && (
        <>
          <p role="alert">{errorMessage}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </>
      )}
      {status === 'success' && (
        <p>
          {data.username} · {data.trophies} trophies
        </p>
      )}
    </section>
  )
}
