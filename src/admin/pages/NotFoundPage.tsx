import { Link } from 'react-router'

/** Shown for any /admin path that matches no route. */
export function NotFoundPage() {
  return (
    <main>
      <title>Page not found – Will of the Void admin</title>
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to the cards</Link>
      </p>
    </main>
  )
}
