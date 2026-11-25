import { Link } from 'react-router'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { shopService } from '../api/shop'
import { paths } from '../routes/paths'

const PAGE_SIZE = 20

/** Loads both lists at once. Declared outside the component so the function stays stable between renders. */
async function load(signal: AbortSignal) {
  const [openings, transactions] = await Promise.all([shopService.listOpenings({ size: PAGE_SIZE }, signal), shopService.listShardTransactions({ size: PAGE_SIZE }, signal)])
  return { openings, transactions }
}

/** Purchase history screen: past pack openings and Shard transactions, newest first. */
export function ShopHistoryPage() {
  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      {/* NOTE: the Figma groups the history by pack type ("Standard pack · 1 pack · 5 cards · 300 Shards spent").
          Here there is one row per opening. Grouping is possible on the frontend: to be decided with the PM. */}
      {/* NOTE: a purchase opens the pack at once (no "owned packs" in the API), so every opening is also a purchase.
          If owned packs are introduced, this page must be reviewed. */}

      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}

      {status === 'success' && (
        <>
          {/* NOTE: only the first page (20 items) is loaded. The response has `totalPages`, so "Load more" or page numbers
              can be added once the PM decides how they look. */}
          <h2>Opened packs</h2>
          {data.openings.items.length === 0 ? (
            // STYLE: empty state. Wording is a placeholder, the Void's voice can be used here.
            <p>No packs opened yet.</p>
          ) : (
            // STYLE: list of openings. Each row links to the result of that opening.
            <ul>
              {data.openings.items.map((opening) => (
                <li key={opening.id}>
                  <Link to={paths.shopOpening(opening.id)}>{opening.pack.name}</Link>
                  <p>
                    {opening.totalCards} cards · {opening.shardsSpent} Shards spent
                  </p>
                  {/* `guarantee` is not null when a guarantee replaced slot 5. Raw value from the API for now. */}
                  {opening.guarantee && <p>Guarantee: {opening.guarantee}</p>}
                  <time dateTime={opening.createdAt}>{new Date(opening.createdAt).toLocaleString('en-US')}</time>
                </li>
              ))}
            </ul>
          )}

          {/* NOTE: same as above, only the first page (20 items) is loaded. */}
          <h2>Shard transactions</h2>
          {data.transactions.items.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            // STYLE: list of Shard movements. `amount` is negative for purchases and positive for rewards:
            // the PM may want a different look for gains and spends.
            <ul>
              {data.transactions.items.map((transaction) => (
                <li key={transaction.id}>
                  {/* `reason` is a raw code from the API (for example a pack purchase or a daily bonus).
                      TODO: map the codes to readable text once the backend list is confirmed. */}
                  <p>{transaction.reason}</p>
                  <p>{transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount} Shards</p>
                  <time dateTime={transaction.createdAt}>{new Date(transaction.createdAt).toLocaleString('en-US')}</time>
                </li>
              ))}
            </ul>
          )}

          {/* STYLE: note from the Figma, shown under the purchases. */}
          <p>Your 30-card starter deck was granted at registration. It is not a purchased starter pack.</p>
        </>
      )}
    </section>
  )
}
