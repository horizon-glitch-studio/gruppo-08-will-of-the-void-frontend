import { SignOutIcon, TrashIcon } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { authService } from '@/shared/api/auth'
import { wrongPasswordAsFieldError } from '@/shared/api/error-message'
import { usersService } from '@/shared/api/users'
import { Button } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Field } from '@/shared/components/Field'
import { Modal } from '@/shared/components/Modal'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { useFormErrorFocus } from '@/shared/hooks/useFormErrorFocus'
import styles from './Settings.module.css'

/** Log out of this device, or delete the account. */
export function AccountSettings() {
  const logout = useApiAction(authService.logout)
  const [deleting, setDeleting] = useState(false)
  // A new form at every opening: no password or error left from the last time
  const [opening, setOpening] = useState(0)

  return (
    <section id="account" aria-labelledby="settings-account" className={`column gap-s ${styles.section}`}>
      <h2 id="settings-account" className="h3">
        Account
      </h2>
      <div className={`row gap-s ${styles.actions}`}>
        <Button icon={<SignOutIcon size={20} weight="bold" />} disabled={logout.pending} onClick={() => void logout.run()}>
          {logout.pending ? 'Logging out…' : 'Log out'}
        </Button>
        <Button
          tone="danger"
          icon={<TrashIcon size={20} weight="bold" />}
          onClick={() => {
            setOpening(opening + 1)
            setDeleting(true)
          }}
        >
          Delete account
        </Button>
      </div>
      {logout.errorMessage && <ErrorBox message={logout.errorMessage} />}
      <DeleteAccountModal key={opening} open={deleting} onClose={() => setDeleting(false)} />
    </section>
  )
}

/**
 * DELETE /users/me with the password. Soft delete on the backend: name and email are anonymised, the history of
 * battles and trades stays for the other Summoners, pending trades and challenges are cancelled, every token ends.
 * Afterwards the player lands on the home page of the site, not on the login.
 */
function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useCurrentUser()
  const remove = useApiAction(async (password: string) => {
    await usersService.deleteAccount(password).catch(wrongPasswordAsFieldError('password'))
    window.location.replace('/')
  })
  const { formRef } = useFormErrorFocus(remove)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void remove.run(String(new FormData(event.currentTarget).get('password')))
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete account">
      <form ref={formRef} className="column gap-s" onSubmit={submit}>
        <p className={styles.warning}>This cannot be undone.</p>
        <ul className={styles.consequences}>
          <li>You lose your cards, decks, Shards and trophies.</li>
          <li>Pending trades and challenges are cancelled.</li>
          <li>Past battles and trades stay in the history of other Summoners, without your name.</li>
        </ul>
        <input type="text" name="username" autoComplete="username" value={user.username} readOnly hidden />
        <Field name="password" label="Password" type="password" autoComplete="current-password" required error={remove.fieldErrors.password} />
        {/* A wrong password is already said on its field, where the focus goes */}
        {remove.errorMessage && Object.keys(remove.fieldErrors).length === 0 && <ErrorBox message={remove.errorMessage} />}
        <div className={`row gap-s ${styles.actions}`}>
          <Button onClick={onClose}>Keep my account</Button>
          <Button tone="danger" variant="primary" type="submit" disabled={remove.pending}>
            {remove.pending ? 'Deleting…' : 'Delete account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
