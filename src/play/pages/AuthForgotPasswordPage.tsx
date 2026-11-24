import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { authService } from '@/shared/api/auth'
import { Button } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Field } from '@/shared/components/Field'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useFormErrorFocus } from '@/shared/hooks/useFormErrorFocus'
import { AuthScreen } from '../components/AuthScreen'
import styles from '../components/AuthScreen.module.css'
import { paths } from '../routes/paths'

/** Requests a password reset link and shows the same confirmation for every email address. */
export function AuthForgotPasswordPage() {
  const { run, pending, errorMessage, fieldErrors, success } = useApiAction(authService.forgotPassword)
  const formRef = useFormErrorFocus({ pending, errorMessage, fieldErrors })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email')).trim()
    void run(email)
  }

  return (
    <>
      <title>Forgot password – Will of the Void</title>
      <AuthScreen title="Forgot password?" backLink={<Link to={paths.login}>Back to Log in</Link>}>
        {success ? (
          <output>If an account exists for that email address, you’ll receive a link to reset your password.</output>
        ) : (
          <form ref={formRef} className="column gap-s" onSubmit={submit}>
            <p>Enter the email address associated with your account to request a password reset link.</p>
            <Field name="email" label="Email address" type="email" autoComplete="email" autoCapitalize="none" required error={fieldErrors.email} />
            {errorMessage && <ErrorBox message={errorMessage} />}
            <Button className={styles.submit} variant="primary" type="submit" disabled={pending}>
              {pending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
      </AuthScreen>
    </>
  )
}
