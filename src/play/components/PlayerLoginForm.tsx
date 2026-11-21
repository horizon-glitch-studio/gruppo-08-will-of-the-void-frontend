import type { FormEvent } from 'react'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { paths } from '../routes/paths'
import { AuthField } from './AuthField'
import { AuthScreen } from './AuthScreen'

interface PlayerLoginFormProps {
  login: (identifier: string, password: string) => Promise<void>
  pending: boolean
  errorMessage?: string
  fieldErrors: Record<string, string>
}

/** Renders the player login form and account-access links. */
export function PlayerLoginForm({ login, pending, errorMessage, fieldErrors }: PlayerLoginFormProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void login(String(data.get('identifier')).trim(), String(data.get('password')))
  }

  return (
    <AuthScreen title="Welcome back to the Void">
      <form className="column gap-s" onSubmit={submit}>
        <AuthField name="identifier" label="Summoner name or email" placeholder="name@example.com" autoComplete="username" autoCapitalize="none" required error={fieldErrors.identifier} />
        <AuthField name="password" label="Password" placeholder="Enter your password" type="password" autoComplete="current-password" required error={fieldErrors.password} />
        {errorMessage && <ErrorBox message={errorMessage} />}
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <nav className="column gap-s" aria-label="Account access">
        <ButtonLink to={paths.forgotPassword}>Forgot password?</ButtonLink>
        <ButtonLink to={paths.register}>Create account</ButtonLink>
        <ButtonLink to={`${paths.register}?invite=1`}>I have an invite code</ButtonLink>
      </nav>
    </AuthScreen>
  )
}
