import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import { useId, useState, type ComponentPropsWithRef } from 'react'
import styles from './Field.module.css'

type FieldProps = { label: string; error?: string } & (({ as?: 'input' } & ComponentPropsWithRef<'input'>) | ({ as: 'select' } & ComponentPropsWithRef<'select'>))

/** Renders an input or select with its label and accessible validation feedback. */
export function Field({ label, error, ...props }: FieldProps) {
  const generatedId = useId()
  const [passwordVisible, setPasswordVisible] = useState(false)
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
    if (input.type === 'password') {
      const VisibilityIcon = passwordVisible ? EyeSlashIcon : EyeIcon
      control = (
        <div className={styles.password}>
          <input {...input} {...accessibility} type={passwordVisible ? 'text' : 'password'} autoCapitalize="none" spellCheck={false} />
          <button
            type="button"
            className={styles.toggle}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-controls={id}
            disabled={input.disabled}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            <VisibilityIcon size={20} aria-hidden="true" />
          </button>
        </div>
      )
    } else {
      control = <input {...input} {...accessibility} />
    }
  }

  return (
    <div className="column gap-2xs">
      <label htmlFor={id}>{label}</label>
      {control}
      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
