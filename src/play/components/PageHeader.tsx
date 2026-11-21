import { CaretLeftIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import styles from './PageHeader.module.css'

/** Props of {@link PageHeader}. */
interface PageHeaderProps {
  title: string
  /** Screen that "back" leads to. No link when missing. */
  back?: { to: string; label: string }
  /** Keeps the heading for screen readers only, for screens whose content already shows where you are. */
  hideTitle?: boolean
}

/** Back link to the parent screen, page heading and browser tab title. */
export function PageHeader({ title, back, hideTitle = false }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <title>{`${title} – Will of the Void`}</title>
      {back && (
        <Link to={back.to} className={styles.back}>
          <CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
          <span className="visually-hidden">Back to </span>
          {back.label}
        </Link>
      )}
      <h1 className={hideTitle ? 'visually-hidden' : styles.title}>{title}</h1>
    </header>
  )
}
