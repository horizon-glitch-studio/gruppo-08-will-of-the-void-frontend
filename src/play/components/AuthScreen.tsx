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
      {backLink && <header className="row">{backLink}</header>}
      <h1 className={styles.title}>{title}</h1>
      {children}
    </section>
  )
}
