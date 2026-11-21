import { Outlet } from 'react-router'
import { GuestTopBar } from '../components/TopBar'
import styles from './AuthLayout.module.css'

/** Layout of the account access screens (login, register, password, email verification): guest top bar (site menu and wordmark), then the screen. */
export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <GuestTopBar />
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
