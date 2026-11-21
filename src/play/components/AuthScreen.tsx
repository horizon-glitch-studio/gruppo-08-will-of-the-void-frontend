import type { ReactNode } from 'react'
import styles from './AuthScreen.module.css'

interface AuthScreenProps {
  title: string
  backLink?: ReactNode
  children: ReactNode
}

/** Centers an account-access screen and renders its heading and optional back link. */
export function AuthScreen({ title, backLink, children }: AuthScreenProps) {
  return (
    <section className={`column gap-s ${styles.screen}`}>
      <header className="row gap-s">
        {backLink}
        <p className={styles.brand}>Will of the Void</p>
      </header>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </section>
  )
}
