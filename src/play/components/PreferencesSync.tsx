import { useEffect } from 'react'
import { usersService } from '@/shared/api/users'
import { applyPreferences, preferencesVersion } from '@/shared/preferences'

/**
 * Loads the accessibility settings of the account and applies them to the page (src/shared/preferences.ts).
 * Once per session: RequireAuth remounts the platform at every new login, so a new player loads their own.
 * Leaving the platform (log out, expired session, deleted account) removes them, so the next person on this device
 * starts from the system settings. If the request fails, the settings of the last visit stay: they are the best guess.
 * Only inside RequireAuth: the request needs a session.
 */
export function PreferencesSync() {
  useEffect(() => {
    const controller = new AbortController()
    const requested = preferencesVersion()
    usersService.getSettings(controller.signal).then(
      // A switch changed meanwhile (Settings page) is newer than this answer
      (settings) => {
        if (preferencesVersion() === requested) applyPreferences(settings)
      },
      () => undefined,
    )
    return () => {
      controller.abort()
      applyPreferences(null)
    }
  }, [])

  return null
}
