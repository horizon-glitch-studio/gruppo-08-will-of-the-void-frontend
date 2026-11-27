import { GlobeHemisphereWestIcon } from '@phosphor-icons/react'
import { useId, useState, type FormEvent } from 'react'
import { usersService } from '@/shared/api/users'
import { Button } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Field } from '@/shared/components/Field'
import { TimeZoneOptions } from '@/shared/components/TimeZoneOptions'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { useFormErrorFocus } from '@/shared/hooks/useFormErrorFocus'
import { deviceTimeZone, timeZoneName } from '@/shared/timeZones'
import styles from './Settings.module.css'

/** Time of day in a zone, like "2:30 PM", so the player can check the zone is theirs. */
function timeIn(timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone }).format(new Date())
  } catch {
    return undefined
  }
}

/**
 * Time zone of the account (PATCH /users/me). The day of the game starts at midnight there: daily bonus and daily limits.
 * The backend allows one change every 30 days (TIMEZONE_CHANGE_TOO_SOON), so the save is a separate, explicit step.
 */
export function TimeZoneSettings() {
  const { user, reload } = useCurrentUser()
  const [zone, setZone] = useState(user.timezone)
  // From the answer of the save: if the reload of the player fails, the page still knows the change went through
  const [savedZone, setSavedZone] = useState(user.timezone)
  const save = useApiAction(async (timezone: string) => {
    const updated = await usersService.updateMe({ timezone })
    setSavedZone(updated.timezone)
    await reload().catch(() => undefined)
  })
  const formRef = useFormErrorFocus(save)
  const hintId = useId()
  const time = timeIn(zone)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void save.run(zone)
  }

  return (
    <section id="time-zone" aria-labelledby="settings-time-zone" className={`column gap-s ${styles.section}`}>
      <h2 id="settings-time-zone" className="h3">
        Time zone
      </h2>
      <form ref={formRef} className="column gap-s" onSubmit={submit}>
        <Field as="select" name="timezone" label="Your time zone" value={zone} aria-describedby={hintId} error={save.fieldErrors.timezone} onChange={(event) => setZone(event.currentTarget.value)}>
          <TimeZoneOptions include={savedZone} />
        </Field>
        <div id={hintId} className="column gap-3xs">
          {time && <p className={styles.hint}>It is {time} there now.</p>}
          <p className={styles.hint}>Your day in the game starts at midnight in this time zone: the daily bonus comes back then. You can change it once every 30 days.</p>
        </div>
        {zone !== deviceTimeZone && (
          <p className={`row gap-xs ${styles.device}`}>
            <span>This device is set to {timeZoneName(deviceTimeZone)}.</span>
            <Button icon={<GlobeHemisphereWestIcon size={18} weight="bold" />} onClick={() => setZone(deviceTimeZone)}>
              Use this one
            </Button>
          </p>
        )}
        {save.errorMessage && <ErrorBox message={save.errorMessage} />}
        <output className={styles.hint}>{save.success && zone === savedZone ? 'Time zone saved.' : ''}</output>
        <div>
          <Button variant="primary" type="submit" disabled={save.pending || zone === savedZone}>
            {save.pending ? 'Saving…' : 'Save time zone'}
          </Button>
        </div>
      </form>
    </section>
  )
}
