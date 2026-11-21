import { useParams } from 'react-router'

/**
 * Temporary page body used until the real screen is built.
 * Title and heading come from the layout. Shows the route parameters so routes can be checked by hand.
 */
export function PagePlaceholder() {
  const params = useParams()
  const entries = Object.entries(params)

  return (
    <section className="column gap-xs">
      <p>This screen is not built yet.</p>
      {entries.length > 0 && (
        <dl>
          {entries.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
