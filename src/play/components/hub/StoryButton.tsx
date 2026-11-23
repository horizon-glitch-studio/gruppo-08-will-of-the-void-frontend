import { BookOpenTextIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { Panel } from '@/shared/components/Panel'
import { paths } from '../../routes/paths'
import styles from './StoryButton.module.css'

/** Hub panel that opens the story; the tutorial follows its last chapter. */
export function StoryButton({ className }: { className?: string }) {
  return (
    <Panel as={Link} to={paths.story(1)} shape="chamfered" className={className ? `${styles.button} ${className}` : styles.button}>
      <span className={styles.content}>
        <BookOpenTextIcon size={28} weight="bold" aria-hidden="true" />
        <span className={styles.text}>
          <span className={styles.title}>The Void is hungry.</span>
          <span className={styles.subtitle}>Story & Tutorial</span>
        </span>
      </span>
    </Panel>
  )
}
