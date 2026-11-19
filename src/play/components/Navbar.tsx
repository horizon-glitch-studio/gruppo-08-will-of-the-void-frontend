import { NavLink } from 'react-router'
import { paths } from '../routes/paths'

const links = [
  { to: paths.hub, label: 'Home', end: true },
  { to: paths.shop, label: 'Shop' },
  { to: paths.ship, label: 'Ship' },
  { to: paths.arena, label: 'Arena' },
  { to: paths.community, label: 'Community' },
  { to: paths.profile, label: 'Profile' },
  { to: paths.settings, label: 'Settings' },
]

/**
 * Temporary navigation bar of the /play app.
 * The site link is a plain anchor because it leaves the React app.
 */
export function Navbar() {
  return (
    <header>
      <nav aria-label="Main">
        <a href="/">Will of the Void</a>
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
