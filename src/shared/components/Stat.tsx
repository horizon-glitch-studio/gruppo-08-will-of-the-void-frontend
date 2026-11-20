import type { ReactNode } from 'react'
import styles from './Stat.module.css'

const numberFormat = new Intl.NumberFormat('en-US')

/** Props of {@link Stat}. */
interface StatProps {
  label: string
  value: number
  /** Decorative icon, hidden from screen readers. */
  icon?: ReactNode
  /** Shows the label only to screen readers, for tight spaces. */
  hideLabel?: boolean
}

/** A number with its label and icon, for example the Shard balance. */
export function Stat({ label, value, icon, hideLabel = false }: StatProps) {
  return (
    <p className={styles.stat}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={hideLabel ? 'visually-hidden' : styles.label}>{label}</span>
      <span className={styles.value}>{numberFormat.format(value)}</span>
    </p>
  )
}
