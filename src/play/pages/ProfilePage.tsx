import { CopyIcon, GearIcon, ShieldCheckIcon, SwordIcon, TrophyIcon, UsersIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { authService } from '@/shared/api/auth'
import { ButtonLink, Button } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { orbitName } from '@/shared/orbits'
import { paths } from '../routes/paths'
import styles from './ProfilePage.module.css'

const numbers = new Intl.NumberFormat('en-US')

/** Date in the player's own time zone, like "November 24, 2026". */
function formatDate(iso: string, timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone }).format(new Date(iso))
  } catch {
    // A zone this browser does not know: the date in the device's own zone
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(iso))
  }
}

/**
 * Profile screen: who you are in the game, your battle record and your account. Data from the session (useCurrentUser),
 * reloaded at each visit: trophies, battles and email verification change after login.
 */
export function ProfilePage() {
  const { user, reload } = useCurrentUser()

  // On failure the data of the session stays on screen
  useEffect(() => {
    reload().catch(() => undefined)
  }, [reload])
  const { stats } = user
  // The backend sends it only while the shield is active
  const { protectedUntil } = user

  return (
    <div className="column gap-l">
      {/* Identity: avatar, name, Orbit and trophies */}
      <Panel as="section" aria-labelledby="profile-name" className={styles.identity}>
        <div className={styles.identityRow}>
          {/* Preset avatars have no images yet: the initial stands in, in a circle like the avatar will be */}
          <span className={styles.avatar} aria-hidden="true">
            {user.username.charAt(0).toUpperCase()}
          </span>
          <div className="column gap-3xs">
            <h2 id="profile-name" className={styles.name}>
              {user.username}
            </h2>
            <p className={styles.meta}>
              <span>{orbitName(user.league)}</span>
              <span aria-hidden="true">·</span>
              <span className="row gap-3xs">
                <TrophyIcon size={18} weight="bold" aria-hidden="true" />
                {numbers.format(user.trophies)} trophies
              </span>
            </p>
            <p className={styles.since}>Summoner since {formatDate(user.createdAt, user.timezone)}</p>
          </div>
        </div>
      </Panel>
      {protectedUntil && (
        <p className={`row gap-2xs ${styles.protected}`}>
          <ShieldCheckIcon size={20} weight="bold" aria-hidden="true" />
          <span>Your Ship is protected from Ranked attacks until {formatDate(protectedUntil, user.timezone)}.</span>
        </p>
      )}

      {/* Battle record */}
      <section aria-labelledby="profile-record" className="column gap-s">
        <h2 id="profile-record" className="h3">
          Battle record
        </h2>
        <dl className={styles.stats}>
          <Record label="Battles" mark={<SwordIcon size={20} weight="bold" />} value={numbers.format(stats.matchesPlayed)} />
          <Record label="Wins" mark="▲" value={numbers.format(stats.wins)} />
          <Record label="Losses" mark="▼" value={numbers.format(stats.losses)} />
          <Record label="Draws" mark="=" value={numbers.format(stats.draws)} />
          <Record label="Win rate" value={stats.matchesPlayed > 0 ? `${numbers.format(stats.winRate)}%` : '–'} />
        </dl>
      </section>

      <AccountSection />

      <nav aria-label="Profile" className={`row gap-s ${styles.links}`}>
        <ButtonLink to={paths.friends} icon={<UsersIcon size={20} weight="bold" />}>
          Friends
        </ButtonLink>
        <ButtonLink to={paths.settings} icon={<GearIcon size={20} weight="bold" />}>
          Settings
        </ButtonLink>
      </nav>
    </div>
  )
}

/** One number of the battle record. The mark is the Arena icon or the advantage signs of the rulebook (▲ ▼ =), only decoration. */
function Record({ label, mark, value }: { label: string; mark?: ReactNode; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="row gap-2xs">
        {mark && (
          <span className={styles.mark} aria-hidden="true">
            {mark}
          </span>
        )}
        {value}
      </dd>
    </div>
  )
}

/** Email and its verification, invite code. Shards are already in the top bar and in the shop. */
function AccountSection() {
  const { user } = useCurrentUser()
  const resend = useApiAction(authService.resendVerification)
  const [copied, setCopied] = useState<'yes' | 'no'>()

  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText(user.inviteCode)
      setCopied('yes')
    } catch {
      // Clipboard refused (permissions, old browser): the code stays selectable on the page
      setCopied('no')
    }
  }

  return (
    <section aria-labelledby="profile-account" className="column gap-s">
      <h2 id="profile-account" className="h3">
        Account
      </h2>
      <dl className={styles.details}>
        <div>
          <dt>Email</dt>
          <dd className="column gap-2xs">
            <span className={styles.email}>{user.email}</span>
            {user.emailVerified ? (
              <span className={styles.verified}>Verified</span>
            ) : (
              <span className="column gap-2xs">
                <span className={styles.unverified}>Not verified yet: some rewards wait for it.</span>
                {resend.success ? (
                  <output>We sent you a new link. Check your inbox.</output>
                ) : (
                  <Button className={styles.inlineAction} disabled={resend.pending} onClick={() => void resend.run()}>
                    {resend.pending ? 'Sending…' : 'Send the link again'}
                  </Button>
                )}
                {resend.errorMessage && <ErrorBox message={resend.errorMessage} />}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Invite code</dt>
          <dd className="column gap-2xs">
            <span className="row gap-xs">
              <code className={styles.code}>{user.inviteCode}</code>
              <Button icon={<CopyIcon size={18} weight="bold" />} onClick={() => void copyInviteCode()}>
                Copy
              </Button>
            </span>
            {/* Read by screen readers when it changes */}
            <output className={styles.hint}>{copied === 'yes' ? 'Copied.' : copied === 'no' ? 'Copy did not work: select the code instead.' : ''}</output>
          </dd>
        </div>
        {user.invitedBy && (
          <div>
            <dt>Invited by</dt>
            <dd>{user.invitedBy}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}
