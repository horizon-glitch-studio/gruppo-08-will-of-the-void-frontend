import type { Settings } from './api/users'

/*
 * Accessibility settings of the account, applied to the whole page as attributes of <html>:
 *   data-motion="reduced"        animations and transitions end at once (base.css), JavaScript motion stops (usePrefersReducedMotion)
 *   data-transparency="reduced"  frosted glass becomes opaque (card.css, panels)
 *   data-labels="text"           faction, rarity and advantages are also written as text
 * The system preferences (prefers-reduced-motion, prefers-reduced-transparency) keep working on their own: the settings only add to them.
 * The last values are kept in localStorage, so the page starts with them before the API answers (no flash of animations).
 */

const STORAGE_KEY = 'wotv.preferences'
const CHANGE_EVENT = 'wotv:preferences'

let version = 0

const attributes = {
  reduceMotion: ['data-motion', 'reduced'],
  reduceTransparency: ['data-transparency', 'reduced'],
  showTextLabels: ['data-labels', 'text'],
} as const satisfies Record<keyof Settings, readonly [string, string]>

/** Applies the settings to the page and remembers them; null removes them (log out, deleted account). */
export function applyPreferences(settings: Settings | null) {
  const root = document.documentElement
  for (const [key, [name, value]] of Object.entries(attributes) as [keyof Settings, readonly [string, string]][]) {
    if (settings?.[key]) root.setAttribute(name, value)
    else root.removeAttribute(name)
  }
  try {
    if (settings) localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked (private mode): the settings still apply to this page
  }
  version++
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Grows at every applyPreferences: an answer requested before a change knows it is out of date. */
export function preferencesVersion() {
  return version
}

/** The settings saved by the last visit, or null. */
export function storedPreferences(): Settings | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (value && typeof value === 'object' && 'reduceMotion' in value && 'reduceTransparency' in value && 'showTextLabels' in value) return value as Settings
  } catch {
    // Missing or broken value: start without settings
  }
  return null
}

/** Calls onChange when the settings change, in this tab. Returns the function that stops listening. */
export function subscribeToPreferences(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

/** True when the reduce motion setting is on. */
export function reducedMotionSetting() {
  return document.documentElement.getAttribute('data-motion') === 'reduced'
}
