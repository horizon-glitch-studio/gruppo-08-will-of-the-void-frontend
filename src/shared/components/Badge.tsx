import styles from './Badge.module.css'

/** Props of {@link Badge}. */
interface BadgeProps {
  count: number
  /** What the number counts, for screen readers. Example: "unread notifications". */
  label: string
  /** Above this number the badge shows "max+". Default: 99. */
  max?: number
}

/** Small counter, for example unread notifications. Renders nothing when the count is 0. */
export function Badge({ count, label, max = 99 }: BadgeProps) {
  if (count <= 0) return null
  return (
    <span className={styles.badge}>
      {count > max ? `${max}+` : count}
      <span className="visually-hidden"> {label}</span>
    </span>
  )
}
