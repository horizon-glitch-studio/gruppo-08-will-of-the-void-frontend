import { useEffect, useId, type FormEvent } from 'react'
import { authService } from '@/shared/api/auth'
import { wrongPasswordAsFieldError } from '@/shared/api/error-message'
import { usersService } from '@/shared/api/users'
import { Button } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Field } from '@/shared/components/Field'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { useFormErrorFocus } from '@/shared/hooks/useFormErrorFocus'
import styles from './Settings.module.css'

/**
 * PUT /users/me/password. The backend logs out every device, this one included (all refresh tokens revoked):
 * a new login with the new password keeps this device signed in, without leaving the page.
 */
export function PasswordSettings() {
  const { user } = useCurrentUser()
  const change = useApiAction(async (currentPassword: string, newPassword: string) => {
    await usersService.changePassword(currentPassword, newPassword).catch(wrongPasswordAsFieldError('currentPassword'))
    await authService.renewSession(user.username, newPassword)
  })
  const { formRef } = useFormErrorFocus(change)
  const hintId = useId()

  // A saved password leaves the form: the fields empty out
  useEffect(() => {
    if (change.success) formRef.current?.reset()
  }, [change.success, formRef])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void change.run(String(data.get('currentPassword')), String(data.get('newPassword')))
  }

  return (
    <section id="security" aria-labelledby="settings-security" className={`column gap-s ${styles.section}`}>
      <h2 id="settings-security" className="h3">
        Security
      </h2>
      <form ref={formRef} className="column gap-s" onSubmit={submit}>
        {/* Tells password managers which account the new password belongs to */}
        <input type="text" name="username" autoComplete="username" value={user.username} readOnly hidden />
        <Field name="currentPassword" label="Current password" type="password" autoComplete="current-password" required error={change.fieldErrors.currentPassword} />
        <Field
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          aria-describedby={hintId}
          error={change.fieldErrors.newPassword}
        />
        <p id={hintId} className={styles.hint}>
          At least 8 characters. Other devices will need to log in again.
        </p>
        {/* A wrong password is already said on its field, where the focus goes */}
        {change.errorMessage && Object.keys(change.fieldErrors).length === 0 && <ErrorBox message={change.errorMessage} />}
        <output className={styles.hint}>{change.success ? 'Password changed. Other devices will need to log in again.' : ''}</output>
        <div>
          <Button variant="primary" type="submit" disabled={change.pending}>
            {change.pending ? 'Changing password…' : 'Change password'}
          </Button>
        </div>
      </form>
    </section>
  )
}
