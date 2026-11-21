import { useId, type ComponentPropsWithRef } from 'react'
import styles from './AuthField.module.css'

interface AuthFieldProps extends ComponentPropsWithRef<'input'> {
  label: string
  error?: string
}

/** Renders a labelled input with an accessible field error. */
export function AuthField({ label, error, ...input }: AuthFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={`column gap-2xs ${styles.field}`}>
      <label htmlFor={id}>{label}</label>
      <input {...input} id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} />
      {error && (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
