import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Field } from '@/shared/components/Field'
import { paths } from '../routes/paths'
import { AuthScreen } from './AuthScreen'
import styles from './AuthScreen.module.css'

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
    <AuthScreen title="Back to the Void">
      <form className="column gap-s" onSubmit={submit}>
        <Field name="identifier" label="Summoner name or email" placeholder="name@example.com" autoComplete="username" autoCapitalize="none" required error={fieldErrors.identifier} />
        <Field name="password" label="Password" placeholder="Enter your password" type="password" autoComplete="current-password" required error={fieldErrors.password} />
        {errorMessage && <ErrorBox message={errorMessage} />}
        <Button className={styles.submit} variant="primary" type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <nav className={`column gap-s ${styles.actions}`} aria-label="Account access">
        <Link to={paths.forgotPassword}>Forgot password?</Link>
        <ButtonLink to={paths.register} variant="secondary">
          Create account
        </ButtonLink>
        <Link to={`${paths.register}?invite=1`}>I have an invite code</Link>
      </nav>
    </AuthScreen>
  )
}
