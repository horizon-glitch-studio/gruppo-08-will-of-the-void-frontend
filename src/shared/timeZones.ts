/*
 * Time zones of a Summoner. The backend accepts only IANA names of a region (Europe/Rome, Etc/UTC) and refuses
 * abbreviations such as UTC or CET (TimezoneRules.isIana checks for a "/"), so plain UTC always becomes Etc/UTC here.
 */

export const UTC = 'Etc/UTC'

/** The name the backend accepts for a zone of the browser. */
function accepted(zone: string) {
  return zone.includes('/') ? zone : UTC
}

/** Time zone of this device, as an IANA name. A device set to UTC reports "UTC": it becomes Etc/UTC. */
export const deviceTimeZone = accepted(Intl.DateTimeFormat().resolvedOptions().timeZone || UTC)

/** A zone written for people: "America/New_York" → "America/New York", Etc/UTC → "UTC". */
export function timeZoneName(zone: string) {
  return zone === UTC ? 'UTC' : zone.replaceAll('_', ' ')
}

export interface TimeZoneOption {
  value: string
  /** City and current offset, like "New York · GMT-5". The region is the group label. */
  label: string
}

export interface TimeZoneGroup {
  region: string
  zones: TimeZoneOption[]
}

let browserZones: string[] | undefined
// Labels are built once per page: one Intl.DateTimeFormat for each of the ~420 zones takes tens of milliseconds on a phone
const labels = new Map<string, string>()

/** "America/Argentina/Buenos_Aires" → "Argentina / Buenos Aires". */
function cityName(zone: string) {
  return zone.split('/').slice(1).join(' / ').replaceAll('_', ' ')
}

/** Offset from UTC right now, like "GMT+1". It changes with daylight saving time, so it is only a hint next to the city. */
function offsetName(zone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value
  } catch {
    return undefined
  }
}

/**
 * Time zones grouped by region (Africa, America…), for a select with <optgroup>. UTC comes first, on its own.
 * extra adds zones the browser may not list, such as the zone saved in the account.
 */
export function timeZoneGroups(...extra: string[]): TimeZoneGroup[] {
  // Chrome and Firefox also list plain names such as UTC, which the backend refuses: Etc/UTC comes first instead
  browserZones ??= (Intl.supportedValuesOf?.('timeZone') ?? []).filter((zone) => zone.includes('/'))
  const zones = [...new Set([deviceTimeZone, ...extra.map(accepted), ...browserZones])].filter((zone) => zone !== UTC).sort()
  const groups = new Map<string, TimeZoneOption[]>()
  for (const zone of zones) {
    const region = zone.split('/')[0]
    let label = labels.get(zone)
    if (!label) {
      const offset = offsetName(zone)
      label = offset ? `${cityName(zone)} · ${offset}` : cityName(zone)
      labels.set(zone, label)
    }
    groups.set(region, [...(groups.get(region) ?? []), { value: zone, label }])
  }
  return [{ region: '', zones: [{ value: UTC, label: 'UTC' }] }, ...[...groups].map(([region, options]) => ({ region, zones: options }))]
}
