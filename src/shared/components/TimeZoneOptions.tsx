import { useMemo } from 'react'
import { timeZoneGroups } from '@/shared/timeZones'

/** Options of a time zone select, grouped by region. Put it inside a <Field as="select">. */
export function TimeZoneOptions({ include }: { include?: string }) {
  const groups = useMemo(() => (include ? timeZoneGroups(include) : timeZoneGroups()), [include])

  return groups.map(({ region, zones }) => {
    const options = zones.map((zone) => (
      <option key={zone.value} value={zone.value}>
        {zone.label}
      </option>
    ))
    return region ? (
      <optgroup key={region} label={region}>
        {options}
      </optgroup>
    ) : (
      options
    )
  })
}
