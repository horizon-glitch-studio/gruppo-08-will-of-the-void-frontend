import type { ReactNode } from 'react'
import styles from './AuthScreen.module.css'

interface AuthScreenProps {
  title: string
  subtitle?: string
  backLink?: ReactNode
  children: ReactNode
}

/** Centers an account-access screen and renders its heading and optional back link. */
export function AuthScreen({ title, subtitle, backLink, children }: AuthScreenProps) {
  return (
    <section className={`column gap-s ${styles.screen}`}>
      {backLink && <header className="row">{backLink}</header>}
      <h1>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {children}
    </section>
  )
}
