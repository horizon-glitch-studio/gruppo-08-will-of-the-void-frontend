import type { FormEvent } from 'react'
import { ErrorBox } from './ErrorBox'
import { Field } from './Field'

interface LoginFormProps {
  login: (identifier: string, password: string) => Promise<void>
  pending: boolean
  errorMessage?: string
  fieldErrors: Record<string, string>
  roleDenied: boolean
}

/** Displays the sign-in form and its validation feedback. */
export function LoginForm({ login, pending, errorMessage, fieldErrors, roleDenied }: LoginFormProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void login(String(data.get('identifier')), String(data.get('password')))
  }

  return (
    <form className="column gap-s" onSubmit={submit}>
      <Field name="identifier" label="Username or email" autoComplete="username" required error={fieldErrors.identifier} />
      <Field name="password" label="Password" type="password" autoComplete="current-password" required error={fieldErrors.password} />
      <button type="submit" disabled={pending}>
        {pending ? 'Please wait…' : 'Log in'}
      </button>
      {errorMessage && <ErrorBox message={errorMessage} />}
      {roleDenied && <ErrorBox message="An administrator account is required." />}
    </form>
  )
}
