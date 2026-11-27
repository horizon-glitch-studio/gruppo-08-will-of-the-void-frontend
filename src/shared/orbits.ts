/** League of a Summoner, from Orbit 1 to Orbit 4, as the backend sends it (enum Orbit). */
export type Orbit = 'ORBIT_1' | 'ORBIT_2' | 'ORBIT_3' | 'ORBIT_4'

/**
 * Display names of the Orbits. The final names are still to be defined (rules/ranking.md, card-set.md):
 * until then the number, as on the home page ("Orbit 4").
 */
export function orbitName(orbit: Orbit) {
  return `Orbit ${orbit.slice(-1)}`
}
