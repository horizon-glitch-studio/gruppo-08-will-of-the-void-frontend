import { ArrowLeftIcon, ArrowRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ButtonLink } from '@/shared/components/Button'
import { Panel } from '@/shared/components/Panel'
import { story } from '../content/story'
import { paths } from '../routes/paths'
import styles from './StoryPage.module.css'

/*
 * The image box takes the shape of the free space, from 3:4 to 4:3 (StoryPage.module.css), and crops the square image with object-fit: cover.
 * The file must cover the long side of the box: at most 4/3 of the window width or height, and of --_image-max (60rem).
 */
const sizes = 'min(133vw, 133vh, 80rem)'

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
            {/* The text tells the story; the picture only sets the scene */}
            <img className={styles.image} src={chapter.image.src} srcSet={chapter.image.srcSet} sizes={sizes} width={chapter.image.width} height={chapter.image.height} alt="" decoding="async" />
          </div>
        </div>

        {/* Under the image, or beside it on wide screens. Plain text; only the voice of the Void gets a frame, so it stands out */}
        {chapter.voice ? (
          <Panel tone="void" className={styles.text}>
            {body}
          </Panel>
        ) : (
          <div className={`${styles.text} ${styles.plain}`}>{body}</div>
        )}
      </div>
    </article>
  )
}
