import { useId, type ComponentPropsWithRef } from 'react'
import styles from './Field.module.css'

type FieldProps = { label: string; error?: string } & (({ as?: 'input' } & ComponentPropsWithRef<'input'>) | ({ as: 'select' } & ComponentPropsWithRef<'select'>))

/** Renders an input or select with its label and accessible validation feedback. */
export function Field({ label, error, ...props }: FieldProps) {
  const generatedId = useId()
  const id = props.id ?? generatedId
  const errorId = error ? `${id}-error` : undefined
  const accessibility = {
    id,
    'aria-invalid': error ? true : props['aria-invalid'],
    'aria-describedby': [props['aria-describedby'], errorId].filter(Boolean).join(' ') || undefined,
  }

  let control
  if (props.as === 'select') {
    const { as: _as, ...select } = props
    control = <select {...select} {...accessibility} />
  } else {
    const { as: _as, ...input } = props
    control = <input {...input} {...accessibility} />
  }

  return (
    <div className={`column gap-2xs ${styles.field}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {error && (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
