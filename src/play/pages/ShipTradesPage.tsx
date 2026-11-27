import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { tradesService } from '../api/trades'
import { paths } from '../routes/paths'

const PAGE_SIZE = 20
const STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'FAILED'] as const

/** Reads a whole number from the URL. Returns undefined when it is missing or not valid. */
function toInt(value: string | null) {
  if (value === null || value === '') return undefined
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 ? number : undefined
}

/** Trades screen: trades received and sent, with accept, reject and cancel for the pending ones. */
export function ShipTradesPage() {
  const [params, setParams] = useSearchParams()

  // The tab and the filters live in the URL (?direction=outgoing&status=PENDING&page=1), so a view can be linked and reloaded.
  const direction = params.get('direction') === 'outgoing' ? 'outgoing' : 'incoming'
  const status = STATUSES.find((item) => item === params.get('status'))
  const page = toInt(params.get('page'))

  /** Changes some URL parameters. A value of undefined removes the parameter. */
  function update(changes: Record<string, string | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined) next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true },
    )
  }

  const load = useCallback((signal: AbortSignal) => tradesService.list({ direction, status, page, size: PAGE_SIZE }, signal), [direction, status, page])
  const query = useApiQuery(load)

  const respond = useApiAction(async (tradeId: number, action: 'accept' | 'reject' | 'cancel') => {
    await tradesService.respond(tradeId, action)
    query.reload()
  })

  /** Cards of one side of a trade, as text. A side can be empty (a gift). */
  const describe = (side: { card: { name: string }; quantity: number }[]) => (side.length === 0 ? 'nothing' : side.map(({ card, quantity }) => `${quantity}× ${card.name}`).join(', '))

  return (
    <section>
      {/* STYLE: tabs "Received" / "Sent". They are links because the tab is in the URL.
          The active one is marked with aria-current: the PM can style it with [aria-current='page']. */}
      <nav aria-label="Trade direction">
        <Link to={{ search: '' }} aria-current={direction === 'incoming' ? 'page' : undefined}>
          Received
        </Link>{' '}
        <Link to={{ search: '?direction=outgoing' }} aria-current={direction === 'outgoing' ? 'page' : undefined}>
          Sent
        </Link>
      </nav>
      {/* STYLE: status filter and "New trade" action. */}
      <label>
        Status{' '}
        <select value={status ?? ''} onChange={(event) => update({ status: event.target.value || undefined, page: undefined })}>
          <option value="">All</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>{' '}
      {/* NOTE: the status names are raw values from the API (PENDING, ACCEPTED...). TODO: readable text. */}
      <Link to={paths.tradeNew()}>New trade</Link>
      {query.status === 'loading' && <output>Loading…</output>}
      {/* STYLE: error state with a "Try again" button. */}
      {query.status === 'error' && <ErrorBox message={query.errorMessage} onRetry={query.reload} />}
      {query.status === 'success' && (
        <>
          {query.data.items.length === 0 && (
            // STYLE: empty state. The text is a placeholder: the Void's voice can be used here.
            <p>{direction === 'incoming' ? 'No trades received.' : 'No trades sent.'}</p>
          )}

          {/* STYLE: list of trades. In the lore a traded creature moves to another Ship. */}
          <ul>
            {query.data.items.map((trade) => {
              const other = direction === 'incoming' ? trade.proposer : trade.recipient
              return (
                <li key={trade.id}>
                  <Link to={paths.trade(trade.id)}>
                    {direction === 'incoming' ? 'From' : 'To'} {other.username}
                  </Link>{' '}
                  <Link to={paths.summoner(other.username)}>Profile</Link>
                  <p>Status: {trade.status}</p>
                  {/* In the API the "offered" cards always come from the Summoner who proposed the trade. */}
                  <p>
                    {direction === 'incoming' ? 'They offer' : 'You offer'}: {describe(trade.offeredCards)}
                  </p>
                  <p>
                    {direction === 'incoming' ? 'They ask' : 'You ask'}: {describe(trade.requestedCards)}
                  </p>
                  <p>
                    Expires <time dateTime={trade.expiresAt}>{new Date(trade.expiresAt).toLocaleString('en-US')}</time>
                  </p>
                  {/* STYLE: actions. Only pending trades can be answered. All buttons are disabled while one request is running.
                      The rules: a trade needs a verified email on both sides and moves all the cards together or none. */}
                  {trade.status === 'PENDING' &&
                    (direction === 'incoming' ? (
                      <>
                        <button type="button" disabled={respond.pending} onClick={() => respond.run(trade.id, 'accept')}>
                          Accept
                        </button>{' '}
                        <button type="button" disabled={respond.pending} onClick={() => respond.run(trade.id, 'reject')}>
                          Reject
                        </button>
                      </>
                    ) : (
                      <button type="button" disabled={respond.pending} onClick={() => respond.run(trade.id, 'cancel')}>
                        Cancel trade
                      </button>
                    ))}
                </li>
              )
            })}
          </ul>

          {/* STYLE: error of the last action. Codes such as TRADE_FAILED, TRADE_MIN_COLLECTION, TRADE_NOT_PENDING and
              EMAIL_NOT_VERIFIED are not mapped yet in src/shared/api/error-message.ts, so a generic message appears.
              Add them there if the PM wants specific texts. */}
          {respond.errorMessage && <ErrorBox message={respond.errorMessage} />}

          {/* STYLE: pagination. */}
          {query.data.totalPages > 1 && (
            <nav aria-label="Pagination">
              <button type="button" disabled={query.data.page <= 0} onClick={() => update({ page: String(query.data.page - 1) })}>
                Previous
              </button>{' '}
              <span>
                Page {query.data.page + 1} of {query.data.totalPages}
              </span>{' '}
              <button type="button" disabled={query.data.page + 1 >= query.data.totalPages} onClick={() => update({ page: String(query.data.page + 1) })}>
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
