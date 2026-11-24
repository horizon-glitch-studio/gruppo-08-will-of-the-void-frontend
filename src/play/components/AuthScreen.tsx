import { ArrowLeftIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '../routes/paths'
import styles from './AuthScreen.module.css'

interface AuthScreenProps {
  title: string
  subtitle?: string
  backToLogin?: boolean
  children: ReactNode
}

/** Centers an account-access screen and renders its heading and optional return link. */
export function AuthScreen({ title, subtitle, backToLogin, children }: AuthScreenProps) {
  return (
    <section className={`column gap-s ${styles.screen}`}>
      {backToLogin && (
        <header className="row">
          <Link to={paths.login} className="row gap-3xs">
            <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
            Back to log in
          </Link>
        </header>
      )}
      <h1>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </section>
  )
}
