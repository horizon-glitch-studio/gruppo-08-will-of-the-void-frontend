import { SwordIcon } from '@phosphor-icons/react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import styles from './VoidLink.module.css'

/**
 * One planet on an orbit.
 * phase: where it starts, from 0 to 1 (0 = right end of the orbit, 0.25 = front, 0.75 = back). Also its place when motion is reduced.
 */
interface Planet {
  orbit: 'inner' | 'middle' | 'outer'
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

const orbits = ['inner', 'middle', 'outer'] as const

/** The Void at the center of the hub, with planets orbiting it. The Void itself is the link to the Arena. */
export function VoidLink() {
  return (
    <div className={styles.scene}>
      <div className={styles.tilt}>
        <div aria-hidden="true">
          {orbits.map((orbit) => (
            <span key={orbit} className={styles.orbit} data-orbit={orbit} />
          ))}
          {planets.map((planet) => (
            <span
              key={`${planet.orbit}-${planet.phase}`}
              className={styles.planet}
              data-orbit={planet.orbit}
              data-color={planet.color}
              data-size={planet.size}
              data-ring={planet.ring || undefined}
              data-front={planet.phase < 0.5 || undefined}
              style={{ '--_phase': planet.phase } as CSSProperties}
            />
          ))}
        </div>
        <Link to={paths.arena} className={styles.void}>
          <span className={styles.disk} aria-hidden="true" />
          <span className={styles.label}>
            <SwordIcon size={28} weight="bold" aria-hidden="true" />
            <span className={styles.text}>Arena</span>
          </span>
        </Link>
      </div>
    </div>
  )
}
