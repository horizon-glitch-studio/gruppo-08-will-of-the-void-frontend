import { SignOutIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { authService } from '@/shared/api/auth'
import { Button } from '@/shared/components/Button'
import { Drawer } from '@/shared/components/Drawer'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { communityService } from '../api/community'
import { paths } from '../routes/paths'

/** Id of the account drawer, for the button that opens it. */
export const ACCOUNT_MENU_ID = 'account-menu'

const accountLinks = [
  { to: paths.profile, label: 'Profile' },
  { to: paths.community, label: 'Community' },
  { to: paths.settings, label: 'Settings' },
]

/** Right drawer: account links, notifications and log out. */
export function AccountMenu() {
  const { user } = useCurrentUser()
  const notifications = useApiQuery(communityService.listNotifications)
  const logout = useApiAction(authService.logout)

  return (
    <Drawer id={ACCOUNT_MENU_ID} title={user.username} side="right">
      <div className="column gap-l">
        <nav aria-label="Account">
          <ul className="list-plain column gap-xs">
            {accountLinks.map(({ to, label }) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="notifications-title" className="column gap-xs">
          <h3 id="notifications-title">Notifications</h3>
          {notifications.status === 'loading' && <output>Loading…</output>}
          {notifications.status === 'error' && <ErrorBox message={notifications.errorMessage} onRetry={notifications.reload} />}
          {notifications.status === 'success' &&
            (notifications.data.length === 0 ? (
              <p>No notifications yet.</p>
            ) : (
              <ul className="list-plain column gap-2xs">
                {notifications.data.map((notification) => (
                  <li key={notification.id}>{notification.type}</li>
                ))}
              </ul>
            ))}
        </section>

        <div className="column gap-xs">
          <Button onClick={() => void logout.run()} disabled={logout.pending} icon={<SignOutIcon size={20} weight="bold" />}>
            {logout.pending ? 'Logging out…' : 'Log out'}
          </Button>
          {logout.errorMessage && <ErrorBox message={logout.errorMessage} />}
        </div>
      </div>
    </Drawer>
  )
}
