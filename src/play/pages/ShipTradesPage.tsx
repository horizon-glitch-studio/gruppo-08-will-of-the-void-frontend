import { ApiPage } from '@/shared/components/ApiPage'
import { tradesService } from '../api/trades'

const load = (signal: AbortSignal) => tradesService.list({ size: 1 }, signal)

/** Trades screen. */
export function ShipTradesPage() {
  return (
    <ApiPage title="Trades" load={load}>
      {(trades) => <p>Trades: {trades.totalItems}</p>}
    </ApiPage>
  )
}
