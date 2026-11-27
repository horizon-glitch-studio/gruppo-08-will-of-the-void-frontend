import { XIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { authService, type LoginBonuses } from '@/shared/api/auth'
import { Panel } from '@/shared/components/Panel'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { takeLoginBonuses } from '@/shared/loginBonuses'
import styles from './BonusNotice.module.css'

/** One request per page load, shared by every mount (StrictMode mounts twice, a new login remounts the layout). */
let claim: Promise<LoginBonuses | null> | undefined

/**
 * The bonuses of the login just done, or else the ones due now (the session was already open).
 * Errors are ignored: the next opening claims again.
 */
function bonusesOnOpen() {
  const fromLogin = takeLoginBonuses()
  if (fromLogin) claim = Promise.resolve(fromLogin)
  claim ??= authService.claimDailyBonus().catch(() => null)
  return claim
}

/** After the notice has shown them, a remount must not show them again. */
function markShown() {
  claim = Promise.resolve(null)
}

const shards = (amount: number) => `+${amount.toLocaleString('en-US')} Shards`

/**
 * Shard bonuses received on opening the platform: daily and coming back after an absence.
 * Shown once, until closed, on the first screen that is not immersive (the story waits for the hub).
 * The box is an <output> (live region, role status): screen readers read it when the text appears.
 */
export function BonusNotice({ hidden }: { hidden: boolean }) {
  const { reload } = useCurrentUser()
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (hidden || done) return
    let active = true
    void bonusesOnOpen().then((bonuses) => {
      if (!active) return
      setDone(true)
      const granted = [
        bonuses?.dailyBonus.granted && `Daily bonus: ${shards(bonuses.dailyBonus.amount)}`,
        bonuses?.comebackBonus.granted && `Welcome back: ${shards(bonuses.comebackBonus.amount)}`,
      ].filter((line): line is string => typeof line === 'string')
      if (granted.length === 0) return
      markShown()
      setLines(granted)
      // The Shard balance in the top bar
      void reload().catch(() => undefined)
    })
    return () => {
      active = false
    }
  }, [hidden, done, reload])

  return (
    <output className={`container ${styles.region}`}>
      {lines.length > 0 && !hidden && (
        <Panel>
          <div className={`row gap-s ${styles.row}`}>
            <ul className={styles.lines}>
              {lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button type="button" className={styles.close} aria-label="Dismiss" onClick={() => setLines([])}>
              <XIcon size={20} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </Panel>
      )}
    </output>
  )
}
