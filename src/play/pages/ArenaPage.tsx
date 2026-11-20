import { ApiPage } from '@/shared/components/ApiPage'
import { arenaService } from '../api/arena'

const load = (signal: AbortSignal) => arenaService.history({ status: 'PLAYED', size: 1 }, signal)

/** Arena screen. */
export function ArenaPage() {
  return (
    <ApiPage title="Arena" load={load}>
      {(battles) => <p>Completed battles: {battles.totalItems}</p>}
    </ApiPage>
  )
}
