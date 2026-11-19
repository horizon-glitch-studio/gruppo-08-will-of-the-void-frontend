import { RouterProvider } from 'react-router'
import { router } from './routes/router'

/** Root of the /admin app. */
export default function App() {
  return <RouterProvider router={router} />
}
