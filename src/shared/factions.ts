/** Factions in the fixed order used everywhere: documents, tables, filters. */
export const FACTIONS = ['lava', 'electro', 'radio', 'ice', 'metal', 'matte', 'gem', 'noble-gas'] as const

/** Faction key, also the suffix of its color token (`--color-<faction>`). */
export type Faction = (typeof FACTIONS)[number]

/** Faction key from the faction name of the API ("Noble Gas" → "noble-gas"); undefined for a name that is not a faction. */
export function factionKey(name: string): Faction | undefined {
  const key = name.trim().toLowerCase().replaceAll(' ', '-')
  return (FACTIONS as readonly string[]).includes(key) ? (key as Faction) : undefined
}
