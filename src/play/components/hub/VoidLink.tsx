import { SwordIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import { Link } from 'react-router'
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion'
import { paths } from '../../routes/paths'
import styles from './VoidLink.module.css'

/*
 * Drawing units: the scene is a 200 × 100 SVG box, centered at (100, 50).
 * Orbits are ellipses around the center, all tilted by TILT degrees.
 * The disk in the middle is HTML (it is the link): 80 units wide, so 40% of the scene width.
 */
const CENTER = { x: 100, y: 50 }
const TILT = -14

/** Orbit radii in drawing units, and the time of one turn. */
const orbits = {
  inner: { rx: 66, ry: 20, seconds: 26 },
  middle: { rx: 82, ry: 26, seconds: 40 },
  outer: { rx: 98, ry: 32, seconds: 60 },
} as const

type OrbitName = keyof typeof orbits

/**
 * One planet on an orbit.
 * phase: where it starts, from 0 to 1 (0 = right end of the orbit, 0.25 = front, 0.75 = back). Also its place when motion is reduced.
 */
interface Planet {
  orbit: OrbitName
  color: 'indigo' | 'violet' | 'purple'
  size: 's' | 'm' | 'l'
  phase: number
  ring?: boolean
}

const planets: Planet[] = [
  { orbit: 'inner', color: 'indigo', size: 'l', phase: 0.15 },
  { orbit: 'middle', color: 'violet', size: 'm', phase: 0.65 },
  { orbit: 'middle', color: 'purple', size: 'm', phase: 0.35, ring: true },
  { orbit: 'outer', color: 'indigo', size: 's', phase: 0.05 },
  { orbit: 'outer', color: 'violet', size: 's', phase: 0.55, ring: true },
  { orbit: 'outer', color: 'purple', size: 's', phase: 0.8 },
]

const radius = { s: 4, m: 6, l: 7.5 } as const

/** Ellipse as a path, starting at its right end and running clockwise: first the front half, then the back half. */
function orbitPath({ rx, ry }: { rx: number; ry: number }) {
  const { x, y } = CENTER
  return `M ${x + rx} ${y} A ${rx} ${ry} 0 1 1 ${x - rx} ${y} A ${rx} ${ry} 0 1 1 ${x + rx} ${y}`
}

/** The orbits and planets, in one of the two layers: behind the disk or in front of it. */
function OrbitLayer({ layer, ids, still }: { layer: 'back' | 'front'; ids: string; still: boolean }) {
  return (
    <svg className={styles.layer} data-layer={layer} viewBox="0 0 200 100" aria-hidden="true">
      {layer === 'back' && (
        <defs>
          {(Object.keys(orbits) as OrbitName[]).map((name) => (
            <path key={name} id={`${ids}-${name}`} d={orbitPath(orbits[name])} />
          ))}
          {/* Half planes in tilted coordinates: above the long axis of the orbits is the back, below is the front */}
          <clipPath id={`${ids}-back`}>
            <rect x="-100" y="-100" width="400" height="150" />
          </clipPath>
          <clipPath id={`${ids}-front`}>
            <rect x="-100" y="50" width="400" height="150" />
          </clipPath>
        </defs>
      )}
      <g transform={`rotate(${TILT} ${CENTER.x} ${CENTER.y})`}>
        <g clipPath={`url(#${ids}-${layer})`}>
          {(Object.keys(orbits) as OrbitName[]).map((name) => (
            <use key={name} href={`#${ids}-${name}`} className={styles.orbit} />
          ))}
        </g>
        {/* Back layer: every planet, whole (the disk covers the ones behind it). Front layer: only the part on the front half */}
        <g clipPath={layer === 'front' ? `url(#${ids}-front)` : undefined}>
          {planets.map((planet) => (
            <PlanetShape key={`${planet.orbit}-${planet.phase}`} planet={planet} ids={ids} still={still} />
          ))}
        </g>
      </g>
    </svg>
  )
}

function PlanetShape({ planet, ids, still }: { planet: Planet; ids: string; still: boolean }) {
  const orbit = orbits[planet.orbit]
  const r = radius[planet.size]
  const begin = `${-orbit.seconds * planet.phase}s`
  const angle = planet.phase * 2 * Math.PI
  // Without motion: fixed on its orbit at its phase
  const place = still ? `translate(${CENTER.x + orbit.rx * Math.cos(angle)} ${CENTER.y + orbit.ry * Math.sin(angle)})` : undefined

  return (
    <g className={styles.planet} data-color={planet.color} transform={place}>
      {!still && (
        <>
          <animateMotion dur={`${orbit.seconds}s`} begin={begin} repeatCount="indefinite">
            <mpath href={`#${ids}-${planet.orbit}`} />
          </animateMotion>
          {/* Bigger and brighter in front, smaller and dimmer behind */}
          <animate attributeName="opacity" values="1;1;0.6;1" keyTimes="0;0.25;0.75;1" dur={`${orbit.seconds}s`} begin={begin} repeatCount="indefinite" />
        </>
      )}
      <g>
        {!still && <animateTransform attributeName="transform" type="scale" values="1;1.15;1;0.8;1" keyTimes="0;0.25;0.5;0.75;1" dur={`${orbit.seconds}s`} begin={begin} repeatCount="indefinite" />}
        <circle r={r} />
        {planet.ring && <ellipse rx={r * 2.1} ry={r * 0.4} className={styles.ring} />}
      </g>
    </g>
  )
}

/**
 * The Void at the center of the hub, with planets orbiting it. The Void itself is the link to the Arena.
 * Depth: orbits and planets are drawn twice, behind the disk and in front of it; the front copy shows only on the front half of each orbit.
 * The drawing is SVG and the glow a box-shadow: neither counts as overflow, so they never add scrollbars, however far they reach.
 */
export function VoidLink() {
  const ids = useId()
  const still = usePrefersReducedMotion()

  return (
    <div className={styles.scene}>
      <OrbitLayer layer="back" ids={ids} still={still} />
      <Link to={paths.arena} className={styles.void}>
        <span className={styles.disk} aria-hidden="true" />
        <span className={styles.label}>
          <SwordIcon size={28} weight="bold" aria-hidden="true" />
          <span className={styles.text}>Arena</span>
        </span>
      </Link>
      <OrbitLayer layer="front" ids={ids} still={still} />
    </div>
  )
}
