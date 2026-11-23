import { CurrencyEthIcon, ListIcon, TrophyIcon, UserIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
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

/** Frame shared by both top bars: site menu button, wordmark, and whatever goes on the right. */
function TopBarFrame({ variant, logo, children }: { variant: 'player' | 'minimal' | 'guest'; logo: ReactNode; children?: ReactNode }) {
  return (
    <div className={styles.bar} data-variant={variant}>
      <Panel as="header">
        <div className={styles.content}>
          <button type="button" popoverTarget={SITE_MENU_ID} className={styles.iconButton} aria-label="Site menu">
            <ListIcon size={28} weight="bold" aria-hidden="true" />
          </button>
          {logo}
          {children}
        </div>
      </Panel>
      <SiteMenu />
    </div>
  )
}

/**
 * Top bar of the platform: site menu, logo (desktop), Shards, Trophies and account menu with unread notifications.
 * minimal (the story): no Shards and Trophies, the wordmark always visible in the middle, as on the login screens.
 */
export function TopBar({ minimal = false }: { minimal?: boolean }) {
  const { user } = useCurrentUser()
  const unread = useApiQuery(communityService.unreadCount)

  return (
    <>
      <TopBarFrame
        variant={minimal ? 'minimal' : 'player'}
        logo={
          <Link to={paths.hub} className={`logo-glow ${styles.logo}`} aria-label="Hub">
            <span className={`logo ${styles.wordmark}`} />
          </Link>
        }
      >
        <div className={`row gap-m ${styles.end}`}>
          {!minimal && (
            <div className={styles.stats}>
              <Stat label="Shards" value={user.shardBalance} icon={<CurrencyEthIcon size={24} weight="bold" />} />
              <Stat label="Trophies" value={user.trophies} icon={<TrophyIcon size={24} weight="bold" />} />
            </div>
          )}
          <button type="button" popoverTarget={ACCOUNT_MENU_ID} className={styles.iconButton} aria-label="Account and notifications">
            <UserIcon size={28} weight="bold" aria-hidden="true" />
            {unread.status === 'success' && (
              <span className={styles.badge}>
                <Badge count={unread.data.count} label="unread notifications" />
              </span>
            )}
          </button>
        </div>
      </TopBarFrame>
      <AccountMenu />
    </>
  )
}

/**
 * Top bar of the account access screens (login, register…), before there is a player: only the site menu and the wordmark.
 * The wordmark leads to the site home, since the hub needs a login.
 */
export function GuestTopBar() {
  return (
    <TopBarFrame
      variant="guest"
      logo={
        <a href="/" className={`logo-glow ${styles.logo}`} aria-label="Will of the Void home">
          <span className={`logo ${styles.wordmark}`} />
        </a>
      }
    />
  )
}
