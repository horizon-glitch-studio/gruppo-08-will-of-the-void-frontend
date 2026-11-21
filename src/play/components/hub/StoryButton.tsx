import { BookOpenTextIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Panel } from '@/shared/components/Panel'
import styles from './StoryButton.module.css'

/** Hub panel that opens the story and tutorial. For now the window only says it is coming. */
export function StoryButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Panel as="button" type="button" shape="chamfered" className={className ? `${styles.button} ${className}` : styles.button} onClick={() => setOpen(true)}>
        <span className={styles.content}>
          <BookOpenTextIcon size={28} weight="bold" aria-hidden="true" />
          <span className={styles.text}>
            <span className={styles.title}>The Void is hungry.</span>
            <span className={styles.subtitle}>Story & Tutorial</span>
          </span>
        </span>
      </Panel>
      <Modal open={open} onClose={() => setOpen(false)} title="The Void is hungry.">
        <p>The story and the tutorial are coming soon.</p>
      </Modal>
    </>
  )
}
