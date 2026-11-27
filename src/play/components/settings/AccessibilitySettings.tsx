import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { apiErrorMessage } from '@/shared/api/error-message'
import { usersService, type Settings } from '@/shared/api/users'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { applyPreferences } from '@/shared/preferences'
import styles from './Settings.module.css'

const switches: { setting: keyof Settings; label: string; hint: string; media?: string; deviceHint?: string }[] = [
  {
    setting: 'reduceMotion',
    label: 'Reduce motion',
    hint: 'Animations and transitions end at once, and nothing moves on its own.',
    media: '(prefers-reduced-motion: reduce)',
    deviceHint: 'Your device already asks for less motion: it applies even with this off.',
  },
  {
    setting: 'showTextLabels',
    label: 'Show text labels',
    hint: 'Factions, rarities and advantages are also written in words, not only shown with colors and icons.',
  },
  {
    setting: 'reduceTransparency',
    label: 'Reduce transparency',
    hint: 'Frosted glass and see-through backgrounds become solid.',
    media: '(prefers-reduced-transparency: reduce)',
    deviceHint: 'Your device already asks for less transparency: it applies even with this off.',
  },
]

/** True while the system media query matches, updated live. */
function useMediaQuery(query: string | undefined) {
  return useSyncExternalStore(
    (onChange) => {
      if (!query) return () => undefined
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => (query ? window.matchMedia(query).matches : false),
  )
}

/**
 * Three switches saved to the account (GET/PATCH /users/me/settings), so they follow the player on every device.
 * A switch applies at once, before the API answers; if the save fails it goes back and says so.
 */
export function AccessibilitySettings() {
  const query = useApiQuery(usersService.getSettings)
  const [shown, setShown] = useState<Settings>()
  const [status, setStatus] = useState<{ saved: true } | { error: string }>()
  const current = useRef<Settings>(undefined)
  // Last state the server confirmed, and the first error since the last answer shown
  const confirmed = useRef<Settings>(undefined)
  const failure = useRef<string>(undefined)
  const queue = useRef(Promise.resolve())
  const latest = useRef(0)
  const settings = shown ?? query.data

  // The account may have changed on another device since the last visit
  useEffect(() => {
    if (query.data) applyPreferences(query.data)
  }, [query.data])

  function show(value: Settings) {
    current.current = value
    setShown(value)
    applyPreferences(value)
  }

  function toggle(key: keyof Settings, value: boolean) {
    if (!settings) return
    const request = ++latest.current
    show({ ...(current.current ?? settings), [key]: value })
    setStatus(undefined)
    const loaded = query.data ?? settings
    // One save at a time, in order: each answer is the whole state after that save. When the last one ends,
    // the switches show what the server has, so a failed save goes back even if later saves were queued
    queue.current = queue.current.then(async () => {
      try {
        confirmed.current = await usersService.updateSettings({ [key]: value })
      } catch (error) {
        failure.current ??= apiErrorMessage(error)
      }
      if (request !== latest.current) return
      show(confirmed.current ?? loaded)
      setStatus(failure.current ? { error: failure.current } : { saved: true })
      failure.current = undefined
    })
  }

  return (
    <section id="accessibility" aria-labelledby="settings-accessibility" className={`column gap-s ${styles.section}`}>
      <h2 id="settings-accessibility" className="h3">
        Accessibility
      </h2>
      {query.status === 'loading' && <output>Loading…</output>}
      {query.status === 'error' && <ErrorBox message={query.errorMessage} onRetry={query.reload} />}
      {settings && (
        <>
          <ul className={`list-plain ${styles.switches}`}>
            {switches.map((item) => (
              <SettingSwitch {...item} key={item.setting} checked={settings[item.setting]} onChange={(value) => toggle(item.setting, value)} />
            ))}
          </ul>
          {/* Read by screen readers when it changes. The switch itself already says on or off */}
          <output className={styles.hint}>{status && 'saved' in status ? 'Saved to your account.' : ''}</output>
          {status && 'error' in status && <ErrorBox message={status.error} />}
        </>
      )}
    </section>
  )
}

function SettingSwitch({ label, hint, media, deviceHint, checked, onChange }: (typeof switches)[number] & { checked: boolean; onChange: (value: boolean) => void }) {
  const id = useId()
  const deviceAsks = useMediaQuery(media)

  return (
    <li className={styles.switch}>
      <label htmlFor={id} className={styles.switchLabel}>
        {label}
      </label>
      <input
        id={id}
        type="checkbox"
        // No aria-checked: the browser exposes the checked state of the native checkbox (ARIA in HTML)
        // oxlint-disable-next-line jsx-a11y/role-has-required-aria-props
        role="switch"
        checked={checked}
        aria-describedby={deviceAsks && !checked ? `${id}-hint ${id}-device` : `${id}-hint`}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <p id={`${id}-hint`} className={styles.hint}>
        {hint}
      </p>
      {deviceAsks && !checked && (
        <p id={`${id}-device`} className={styles.hint}>
          {deviceHint}
        </p>
      )}
    </li>
  )
}
