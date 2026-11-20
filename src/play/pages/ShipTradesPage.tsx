import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { tradesService } from '../api/trades'

const load = (signal: AbortSignal) => tradesService.list({ size: 1 }, signal)

/** Trades screen. */
export function ShipTradesPage() {
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      <title>Trades – Will of the Void</title>
      <h1>Trades</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && (
        <>
          <p role="alert">{errorMessage}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </>
      )}
      {status === 'success' && <p>Trades: {data.totalItems}</p>}
    </section>
  )
}
