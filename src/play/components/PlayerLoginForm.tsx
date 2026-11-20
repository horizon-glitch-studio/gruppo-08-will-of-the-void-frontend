import { type FormEvent } from 'react'
import { Link } from 'react-router'
import { paths } from '../routes/paths'
import { AuthField } from './AuthField'
import '../styles/auth.css'

interface PlayerLoginFormProps {
  login: (identifier: string, password: string) => Promise<void>
  pending: boolean
  errorMessage?: string
  fieldErrors: Record<string, string>
}

export function PlayerLoginForm({ login, pending, errorMessage, fieldErrors }: PlayerLoginFormProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void login(String(data.get('identifier')).trim(), String(data.get('password')))
  }

  return (
    <section className="auth-screen">
      <p className="auth-brand">Will of the Void</p>
      <h1>Welcome back to the Void</h1>
      <form className="auth-stack" onSubmit={submit}>
        <AuthField name="identifier" label="Summoner name or email" placeholder="name@example.com" autoComplete="username" autoCapitalize="none" required error={fieldErrors.identifier} />
        <AuthField name="password" label="Password" placeholder="Enter your password" type="password" autoComplete="current-password" required error={fieldErrors.password} />
        {errorMessage && (
          <p className="auth-error" role="alert">
            {errorMessage}
          </p>
        )}
        <button className="auth-button auth-button-primary" type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <nav className="auth-stack auth-links" aria-label="Account access">
        <Link className="auth-button" to={paths.forgotPassword}>
          Forgot password?
        </Link>
        <Link className="auth-button" to={paths.register}>
          Create account
        </Link>
        <Link className="auth-button" to={`${paths.register}?invite=1`}>
          I have an invite code
        </Link>
      </nav>
    </section>
  )
}
