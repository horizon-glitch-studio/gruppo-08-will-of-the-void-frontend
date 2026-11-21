import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { tradesService } from '../api/trades'

const load = (signal: AbortSignal) => tradesService.list({ size: 1 }, signal)

/** Trades screen. */
export function ShipTradesPage() {
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}
      {status === 'success' && <p>Trades: {data.totalItems}</p>}
    </section>
  )
}
