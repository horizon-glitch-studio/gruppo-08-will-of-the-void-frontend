import type { FormEvent } from 'react'
import { authService } from '@/shared/api/auth'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Field } from '@/shared/components/Field'
import { Panel } from '@/shared/components/Panel'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useFormErrorFocus } from '@/shared/hooks/useFormErrorFocus'
import { AuthScreen } from '../components/AuthScreen'
import styles from '../components/AuthScreen.module.css'
import { paths } from '../routes/paths'

/** Requests a reset link without revealing whether the email belongs to an account. */
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
      <AuthScreen title={success ? 'Check your inbox' : 'Reset your password'} backToLogin={!success}>
        {success ? (
          <>
            <Panel>
              <output>If this email belongs to an account, a reset link has been sent. Check your spam folder too.</output>
            </Panel>
            <ButtonLink className={styles.submit} to={paths.login}>
              Return to log in
            </ButtonLink>
          </>
        ) : (
          <form ref={formRef} className="column gap-s" onSubmit={submit}>
            <Field name="email" label="Email" placeholder="name@example.com" type="email" autoComplete="email" autoCapitalize="none" required error={fieldErrors.email} />
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
