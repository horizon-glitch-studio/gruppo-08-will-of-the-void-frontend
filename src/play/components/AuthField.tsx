import { useId, type ComponentPropsWithRef } from 'react'

interface AuthFieldProps extends ComponentPropsWithRef<'input'> {
  label: string
  error?: string
}

export function AuthField({ label, error, ...input }: AuthFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input {...input} id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} />
      {error && (
        <p className="auth-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
