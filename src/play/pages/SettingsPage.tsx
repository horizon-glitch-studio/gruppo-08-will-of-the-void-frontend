import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { AccessibilitySettings } from '../components/settings/AccessibilitySettings'
import { AccountSettings } from '../components/settings/AccountSettings'
import { PasswordSettings } from '../components/settings/PasswordSettings'
import { TimeZoneSettings } from '../components/settings/TimeZoneSettings'

/**
 * Settings screen: accessibility, time zone, password, log out and account deletion. One section per component in components/settings.
 * Each section is an anchor: #accessibility, #time-zone, #security, #account.
 */
export function SettingsPage() {
  const { hash } = useLocation()

  // The browser scrolls to the anchor only if it exists at load: here the page appears after the session check
  useEffect(() => {
    if (!hash) return
    let id = hash.slice(1)
    try {
      id = decodeURIComponent(id)
    } catch {
      // Broken escape in a shared link (#%E0): look for the id as written
    }
    document.getElementById(id)?.scrollIntoView()
  }, [hash])

  return (
    <div className="column gap-xl">
      <AccessibilitySettings />
      <TimeZoneSettings />
      <PasswordSettings />
      <AccountSettings />
    </div>
  )
}
