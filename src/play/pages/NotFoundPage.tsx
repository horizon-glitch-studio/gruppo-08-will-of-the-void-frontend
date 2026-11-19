import { Link } from 'react-router'
import { paths } from '../routes/paths'

/** Shown for any /play path that matches no route. */
export function NotFoundPage() {
  return (
    <main>
      <title>Page not found – Will of the Void</title>
      <h1>The Void got to this page first.</h1>
      <p>
        <Link to={paths.hub}>Back to the Ship</Link>
      </p>
    </main>
  )
}
