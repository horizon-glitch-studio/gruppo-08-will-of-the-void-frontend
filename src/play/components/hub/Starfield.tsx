import styles from './Starfield.module.css'

/** Same numbers on every load, so the sky never changes between visits. */
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** white: a white star with a halo of its tone. colored: the whole star in its tone. */
interface Star {
  x: number
  y: number
  r: number
  kind: 'white' | 'colored'
  tone: 'indigo' | 'violet' | 'purple'
  twinkle: boolean
  delay: number
}

const tones: Star['tone'][] = ['indigo', 'violet', 'purple']
const STAR_COUNT = 180
const TWINKLE_COUNT = 20

/** Most stars sit along a tilted band, like a galaxy seen from the side; the rest are scattered. */
function createStars(): Star[] {
  const random = seededRandom(8)

  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const x = random() * 1000
    const inBand = index % 5 !== 0
    // Band: line from (0, 700) to (1000, 300); the sum of two randoms keeps more stars near the line
    const y = inBand ? 700 - x * 0.4 + (random() + random() - 1) * 220 : random() * 1000
    return {
      x,
      y,
      r: 0.6 + random() ** 3 * 1.6,
      kind: random() < 0.6 ? 'white' : 'colored',
      tone: tones[Math.floor(random() * tones.length)],
      twinkle: index < TWINKLE_COUNT,
      delay: random() * -6,
    }
  })
}

const stars = createStars()

/** Background of the hub: stars and a faint nebula. Decorative, hidden from screen readers. */
export function Starfield() {
  return (
    <div className={styles.sky} aria-hidden="true">
      <svg className={styles.stars} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Soft halo: the tone fades to transparent */}
          {tones.map((tone) => (
            <radialGradient key={tone} id={`star-halo-${tone}`} data-tone={tone}>
              <stop offset="0%" className={styles.haloStop} />
              <stop offset="100%" className={`${styles.haloStop} ${styles.haloEnd}`} />
            </radialGradient>
          ))}
        </defs>
        {stars.map((star, index) => (
          <g
            key={index}
            data-kind={star.kind}
            data-tone={star.tone}
            className={star.twinkle ? styles.twinkle : undefined}
            style={star.twinkle ? { animationDelay: `${star.delay.toFixed(2)}s` } : undefined}
          >
            {star.kind === 'white' && <circle fill={`url(#star-halo-${star.tone})`} cx={star.x.toFixed(1)} cy={star.y.toFixed(1)} r={(star.r * 3.5).toFixed(2)} />}
            <circle className={styles.core} cx={star.x.toFixed(1)} cy={star.y.toFixed(1)} r={star.r.toFixed(2)} />
          </g>
        ))}
      </svg>
    </div>
  )
}
