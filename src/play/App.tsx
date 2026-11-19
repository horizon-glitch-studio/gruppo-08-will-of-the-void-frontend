import { RouterProvider } from 'react-router'
import { router } from './routes/router'

/** Root of the /play app. */
export default function App() {
  return <RouterProvider router={router} />
}
