import { XIcon } from '@phosphor-icons/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import styles from './Drawer.module.css'

/** Props of {@link Drawer}. */
interface DrawerProps {
  /** Id of the drawer. Open it with a button that has popoverTarget set to this id. */
  id: string
  title: string
  side?: 'left' | 'right'
  children: ReactNode
}

/**
 * Side panel opened by a button with `popoverTarget={id}`.
 * Closes with its close button, Esc, a click outside, or when the route changes.
 */
export function Drawer({ id, title, side = 'left', children }: DrawerProps) {
  const ref = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const shownPath = useRef(pathname)
  const titleId = `${id}-title`

  // A link inside the drawer changes the route without reloading the page: close the drawer
  useEffect(() => {
    if (shownPath.current === pathname) return
    shownPath.current = pathname
    if (ref.current?.matches(':popover-open')) ref.current.hidePopover()
  }, [pathname])

  return (
    <section ref={ref} id={id} popover="auto" aria-labelledby={titleId} className={styles.drawer} data-side={side}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <button type="button" popoverTarget={id} popoverTargetAction="hide" className={styles.close} aria-label="Close">
          <XIcon size={24} weight="bold" aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  )
}
