import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { authService } from '@/shared/api/auth'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Field } from '@/shared/components/Field'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useFormErrorFocus } from '@/shared/hooks/useFormErrorFocus'
import { AuthScreen } from '../components/AuthScreen'
import styles from '../components/AuthScreen.module.css'
import { paths } from '../routes/paths'

/** Opens the password reset link and updates the password through the auth service. */
export function AuthResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  return <ResetPasswordScreen key={token} token={token} />
}

function ResetPasswordScreen({ token }: { token: string }) {
  const { run, pending, errorCode, errorMessage, fieldErrors, success } = useApiAction(authService.resetPassword)
  const invalidToken = errorCode === 'ACTION_TOKEN_INVALID'
  const title = success ? 'Password updated' : invalidToken ? 'Reset link expired' : token ? 'Choose a new password' : 'Reset link incomplete'
  const { formRef, feedbackRef } = useFormErrorFocus({ pending, errorMessage, fieldErrors, focusFeedback: success || invalidToken })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const password = String(new FormData(event.currentTarget).get('newPassword'))
    void run(token, password)
  }

  return (
    <AuthScreen title={title} backToLogin={!success}>
      {success ? (
        <>
          <output ref={feedbackRef} tabIndex={-1}>
            You can now log in with your new password.
          </output>
          <ButtonLink className={styles.submit} to={paths.login}>
            Return to log in
          </ButtonLink>
        </>
      ) : !token || invalidToken ? (
        <>
          <ErrorBox message={errorMessage ?? 'This reset link is incomplete. Request a new one to continue.'} />
          <Link ref={feedbackRef} className={styles.submit} to={paths.forgotPassword}>
            Request a new reset link
          </Link>
        </>
      ) : (
        <form ref={formRef} className="column gap-s" onSubmit={submit}>
          <Field name="newPassword" label="New password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required error={fieldErrors.newPassword} />
          {errorMessage && <ErrorBox message={errorMessage} />}
          <Button className={styles.submit} variant="primary" type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      )}
    </AuthScreen>
  )
}
