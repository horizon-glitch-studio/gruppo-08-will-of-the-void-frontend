import { useParams } from 'react-router'

/** Props of {@link PagePlaceholder}. */
interface PagePlaceholderProps {
  /** Page name, shown as heading and in the browser tab. */
  title: string
}

/**
 * Temporary page body used until the real screen is built.
 * Shows the route parameters so routes can be checked by hand.
 */
export function PagePlaceholder({ title }: PagePlaceholderProps) {
  const params = useParams()
  const entries = Object.entries(params)

  return (
    <section>
      <title>{`${title} – Will of the Void`}</title>
      <h1>{title}</h1>
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
