import { CurrencyEthIcon, ListIcon, TrophyIcon, UserIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Badge } from '@/shared/components/Badge'
import { Panel } from '@/shared/components/Panel'
import { Stat } from '@/shared/components/Stat'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { communityService } from '../api/community'
import { paths } from '../routes/paths'
import { ACCOUNT_MENU_ID, AccountMenu } from './AccountMenu'
import { SITE_MENU_ID, SiteMenu } from './SiteMenu'
import styles from './TopBar.module.css'

/** Top bar of the platform: site menu, logo (desktop), Shards, Trophies and account menu with unread notifications. */
export function TopBar() {
  const { user } = useCurrentUser()
  const unread = useApiQuery(communityService.unreadCount)

  return (
    <div className={styles.bar}>
      <Panel as="header">
        <div className={styles.content}>
          <button type="button" popoverTarget={SITE_MENU_ID} className={styles.iconButton} aria-label="Site menu">
            <ListIcon size={28} weight="bold" aria-hidden="true" />
          </button>

          <Link to={paths.hub} className={`logo-glow ${styles.logo}`} aria-label="Hub">
            <span className={`logo ${styles.wordmark}`} />
          </Link>

          <div className={`row gap-m ${styles.end}`}>
            <div className={styles.stats}>
              <Stat label="Shards" value={user.shardBalance} icon={<CurrencyEthIcon size={24} weight="bold" />} />
              <Stat label="Trophies" value={user.trophies} icon={<TrophyIcon size={24} weight="bold" />} />
            </div>
            <button type="button" popoverTarget={ACCOUNT_MENU_ID} className={styles.iconButton} aria-label="Account and notifications">
              <UserIcon size={28} weight="bold" aria-hidden="true" />
              {unread.status === 'success' && (
                <span className={styles.badge}>
                  <Badge count={unread.data.count} label="unread notifications" />
                </span>
              )}
            </button>
          </div>
        </div>
      </Panel>
      <SiteMenu />
      <AccountMenu />
    </div>
  )
}
