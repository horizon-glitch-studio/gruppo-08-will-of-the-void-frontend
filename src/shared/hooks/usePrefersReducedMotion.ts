import { useSyncExternalStore } from 'react'
import { reducedMotionSetting, subscribeToPreferences } from '../preferences'

const query = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onChange)
  const stop = subscribeToPreferences(onChange)
  return () => {
    media.removeEventListener('change', onChange)
    stop()
  }
}

/**
 * True when the user asked for less motion: in the system, or in the account settings (Settings page). Updates live.
 * For motion that CSS cannot stop, such as SVG animations (SMIL) and view transitions started from JavaScript.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches || reducedMotionSetting(),
    () => false,
  )
}
