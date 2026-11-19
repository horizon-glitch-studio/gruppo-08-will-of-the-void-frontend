import { Outlet } from 'react-router'
import { Navbar } from '../components/Navbar'

/** Layout of the logged-in platform: navigation bar and main content. */
export function PlatformLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}
