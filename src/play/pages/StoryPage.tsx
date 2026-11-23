import { ArrowLeftIcon, ArrowRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ButtonLink } from '@/shared/components/Button'
import { Panel } from '@/shared/components/Panel'
import { story } from '../content/story'
import { paths } from '../routes/paths'
import styles from './StoryPage.module.css'

/*
 * The image box takes the shape of the free space, from 3:4 to 4:3 (StoryPage.module.css).
 * The crop follows the window: portrait at 3:4 or taller, landscape at 4:3 or wider, square in between, always in cover.
 * The window is a little taller than the free space (top bar and links), so near the two limits the crop is an approximation.
 */
const landscapeMedia = '(min-aspect-ratio: 4/3)'
const squareMedia = '(min-aspect-ratio: 3/4)'
const sizes = {
  landscape: 'calc(100vh * 4 / 3)',
  square: 'min(100vw, 100vh)',
  portrait: '100vw',
}

/*
 * Chapters replace each other in the browser history: Back leaves the story at once instead of going through nine pages.
 * One address per chapter still lets a reload keep the chapter, and lets the router cross-fade between them.
 */
const go = { replace: true, viewTransition: true } as const

/** The story before the game: one chapter per address (/story/1 to /story/9), then the tutorial. */
export function StoryPage() {
  const navigate = useNavigate()
  const number = Number(useParams().chapter)
  const valid = Number.isInteger(number) && number >= 1 && number <= story.length
  const chapter = valid ? story[number - 1] : undefined
  const previous = number > 1 ? paths.story(number - 1) : undefined
  const next = number < story.length ? paths.story(number + 1) : paths.tutorial

  // Arrow keys move between chapters, like the links
  useEffect(() => {
    if (!valid) return
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key === 'ArrowRight') void navigate(next, go)
      if (event.key === 'ArrowLeft' && previous) void navigate(previous, go)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, next, previous, valid])

  if (!chapter) return <Navigate to={paths.story(1)} replace />

  const last = number === story.length
  const { portrait, square, landscape } = chapter.images

  const body = (
    <div className={styles.body}>
      {/* Read aloud when the chapter changes */}
      <div aria-live="polite" className={styles.words}>
        {chapter.voice ? (
          <blockquote className={styles.quote}>
            <span className={styles.mark} data-side="open" aria-hidden="true">
              «
            </span>
            <p>{chapter.text}</p>
            <span className={styles.mark} data-side="close" aria-hidden="true">
              »
            </span>
          </blockquote>
        ) : (
          <p>{chapter.text}</p>
        )}
      </div>

      <nav className={styles.pager} aria-label="Story">
        {previous ? (
          <Link to={previous} {...go} className={styles.step} aria-label="Previous chapter">
            <CaretLeftIcon size={24} weight="bold" aria-hidden="true" />
          </Link>
        ) : (
          <span className={styles.step} aria-hidden="true" />
        )}
        <p className={styles.counter}>
          <span className="visually-hidden">Chapter </span>
          {number}
          <span aria-hidden="true">/</span>
          <span className="visually-hidden"> of </span>
          {story.length}
        </p>
        {last ? (
          <ButtonLink to={next} viewTransition variant="primary">
            I&apos;m ready
          </ButtonLink>
        ) : (
          <Link to={next} {...go} className={styles.step} aria-label="Next chapter">
            <CaretRightIcon size={24} weight="bold" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  )

  return (
    <article className={styles.story} aria-label={`Chapter ${number} of ${story.length}`}>
      {/* Above the image, never over it: the way back and the way past the story */}
      <div className={styles.links}>
        <Link to={paths.hub} className={styles.link}>
          <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
          Hub
        </Link>
        {!last && (
          <Link to={paths.tutorial} className={styles.link}>
            Skip
            <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className={styles.stage}>
        <div className={styles.media}>
          <div className={styles.frame}>
            <picture>
              <source media={landscapeMedia} srcSet={landscape.srcSet} sizes={sizes.landscape} width={landscape.width} height={landscape.height} />
              <source media={squareMedia} srcSet={square.srcSet} sizes={sizes.square} width={square.width} height={square.height} />
              {/* The text tells the story; the picture only sets the scene */}
              <img className={styles.image} src={portrait.src} srcSet={portrait.srcSet} sizes={sizes.portrait} width={portrait.width} height={portrait.height} alt="" decoding="async" />
            </picture>
          </div>
        </div>

        {/* Under the image, or beside it on wide screens. Plain text; only the voice of the Void gets a frame, so it stands out */}
        {chapter.voice ? <Panel className={`${styles.text} ${styles.voice}`}>{body}</Panel> : <div className={`${styles.text} ${styles.plain}`}>{body}</div>}
      </div>
    </article>
  )
}
