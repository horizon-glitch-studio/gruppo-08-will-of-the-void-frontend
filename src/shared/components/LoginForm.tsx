import { useId, type FormEvent } from 'react'
import { ErrorBox } from './ErrorBox'

interface LoginFormProps {
  login: (identifier: string, password: string) => Promise<void>
  pending: boolean
  errorMessage?: string
  fieldErrors: Record<string, string>
  roleDenied: boolean
}

/** Displays the sign-in form and its validation feedback. */
export function LoginForm({ login, pending, errorMessage, fieldErrors, roleDenied }: LoginFormProps) {
  const id = useId()
  const identifierErrorId = `${id}-identifier-error`
  const passwordErrorId = `${id}-password-error`

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void login(String(data.get('identifier')), String(data.get('password')))
  }

  return (
    <form onSubmit={submit}>
      <p>
        <label>
          Username or email{' '}
          <input name="identifier" autoComplete="username" required aria-invalid={!!fieldErrors.identifier} aria-describedby={fieldErrors.identifier ? identifierErrorId : undefined} />
        </label>
      </p>
      {fieldErrors.identifier && <p id={identifierErrorId}>{fieldErrors.identifier}</p>}
      <p>
        <label>
          Password{' '}
          <input name="password" type="password" autoComplete="current-password" required aria-invalid={!!fieldErrors.password} aria-describedby={fieldErrors.password ? passwordErrorId : undefined} />
        </label>
      </p>
      {fieldErrors.password && <p id={passwordErrorId}>{fieldErrors.password}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Please wait…' : 'Log in'}
      </button>
      {errorMessage && <ErrorBox message={errorMessage} />}
      {roleDenied && <ErrorBox message="An administrator account is required." />}
    </form>
  )
}
