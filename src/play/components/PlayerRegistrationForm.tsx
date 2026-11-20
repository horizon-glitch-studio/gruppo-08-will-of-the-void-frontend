import { useEffect, useId, useRef, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { Registration } from '@/shared/api/auth'
import { paths } from '../routes/paths'
import { AuthField } from './AuthField'
import '../styles/auth.css'

interface PlayerRegistrationFormProps {
  register: (fields: Registration) => Promise<void>
  pending: boolean
  errorMessage?: string
  fieldErrors: Record<string, string>
  success: boolean
}

const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
const timeZones = [...new Set(['UTC', detectedTimeZone, ...(Intl.supportedValuesOf?.('timeZone') ?? [])])].sort()

export function PlayerRegistrationForm({ register, pending, errorMessage, fieldErrors, success }: PlayerRegistrationFormProps) {
  const id = useId()
  const [searchParams] = useSearchParams()
  const timeZoneError = fieldErrors.timezone
  const inviteInput = useRef<HTMLInputElement>(null)
  const enteringInvite = searchParams.has('invite')

  useEffect(() => {
    if (enteringInvite) inviteInput.current?.focus()
  }, [enteringInvite])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const inviteCode = String(data.get('inviteCode')).trim()

    void register({
      username: String(data.get('username')).trim(),
      email: String(data.get('email')).trim(),
      password: String(data.get('password')),
      timezone: String(data.get('timezone')),
      ...(inviteCode && { inviteCode }),
    })
  }

  return (
    <section className="auth-screen">
      <header className="auth-flow-header">
        <Link className="auth-button" to={paths.login}>
          Back to Log in
        </Link>
        <p className="auth-brand">Will of the Void</p>
      </header>
      {success ? (
        <>
          <h1>Account created</h1>
          <output>Check your inbox for the verification email. You can log in now.</output>
        </>
      ) : (
        <>
          <h1>Create your account</h1>
          <form className="auth-stack" onSubmit={submit}>
            <AuthField
              name="username"
              label="Summoner name"
              placeholder="Choose your name"
              autoComplete="username"
              autoCapitalize="none"
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]+"
              required
              error={fieldErrors.username}
            />
            <AuthField name="email" label="Email" placeholder="name@example.com" type="email" autoComplete="email" maxLength={255} required error={fieldErrors.email} />
            <AuthField
              name="password"
              label="Password"
              placeholder="Create a password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              error={fieldErrors.password}
            />
            <div className="auth-field">
              <label htmlFor={id}>Time zone</label>
              <select id={id} name="timezone" defaultValue={detectedTimeZone} aria-invalid={timeZoneError ? true : undefined} aria-describedby={timeZoneError ? `${id}-error` : undefined}>
                {timeZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              {timeZoneError && (
                <p className="auth-error" id={`${id}-error`}>
                  {timeZoneError}
                </p>
              )}
            </div>
            <AuthField name="inviteCode" label="Invite code · optional" placeholder="Enter the code" ref={inviteInput} error={fieldErrors.inviteCode} />
            <p className="auth-legal">
              By creating an account you accept the <a href="/terms/">Terms</a> and <a href="/privacy/">Privacy Policy</a>.
            </p>
            {errorMessage && (
              <p role="alert" className="auth-error">
                {errorMessage}
              </p>
            )}
            <button className="auth-button auth-button-primary" type="submit" disabled={pending}>
              {pending ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}
