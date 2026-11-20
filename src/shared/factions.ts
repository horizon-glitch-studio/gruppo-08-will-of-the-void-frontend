/** Factions in the fixed order used everywhere: documents, tables, filters. */
export const FACTIONS = ['lava', 'electro', 'radio', 'ice', 'metal', 'matte', 'gem', 'noble-gas'] as const

/** Faction key, also the suffix of its color token (`--color-<faction>`). */
export type Faction = (typeof FACTIONS)[number]
