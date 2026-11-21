import { XIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './Modal.module.css'
import { Panel } from './Panel'

/** Props of {@link Modal}. */
interface ModalProps {
  open: boolean
  /** Called when the modal asks to close: close button, Esc, or a click outside. Set open to false here. */
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Modal window on a native <dialog>: the browser keeps the focus inside and closes it with Esc.
 * Controlled by the parent through open and onClose.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    // A click on the backdrop reaches the dialog itself: close. Esc is handled by the browser, so no key handler is needed
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={styles.modal}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <Panel shape="chamfered" className={styles.panel}>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <XIcon size={24} weight="bold" aria-hidden="true" />
          </button>
        </div>
        {children}
      </Panel>
    </dialog>
  )
}
