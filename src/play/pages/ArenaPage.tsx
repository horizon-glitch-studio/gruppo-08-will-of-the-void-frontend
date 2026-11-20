import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { arenaService } from '../api/arena'

const load = (signal: AbortSignal) => arenaService.history({ status: 'PLAYED', size: 1 }, signal)

/** Arena screen. */
export function ArenaPage() {
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      <title>Arena – Will of the Void</title>
      <h1>Arena</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}
      {status === 'success' && <p>Completed battles: {data.totalItems}</p>}
    </section>
  )
}
