import { RocketLaunchIcon, ShoppingCartSimpleIcon, SwordIcon } from '@phosphor-icons/react'
import { NavLink } from 'react-router'
import { paths } from '../routes/paths'
import styles from './BottomNav.module.css'

/** The three game areas. The link of the current area gets aria-current="page". */
const areas = [
  { to: paths.shop, label: 'Shop', tone: 'shop', Icon: ShoppingCartSimpleIcon },
  { to: paths.arena, label: 'Arena', tone: 'arena', Icon: SwordIcon },
  { to: paths.ship, label: 'Ship', tone: 'ship', Icon: RocketLaunchIcon },
] as const

/** Navigation between Shop, Arena and Ship, fixed at the bottom of the screen. */
export function BottomNav() {
  return (
    <nav aria-label="Game areas" className={styles.nav}>
      <ul className={`list-plain ${styles.list}`}>
        {areas.map(({ to, label, tone, Icon }) => (
          <li key={to}>
            <NavLink to={to} className={styles.link} data-tone={tone}>
              <Icon size={28} weight="bold" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
