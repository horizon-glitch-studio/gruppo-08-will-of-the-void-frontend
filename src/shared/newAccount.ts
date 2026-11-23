/*
 * A new account starts with the story: registration marks the username on this device, the first login with it opens the story once.
 * Device only: an account created on another device starts from the hub, like any other login.
 */

const storageKey = 'wotv.newAccount'

/** Remembers that this username has just been registered on this device. */
export function markNewAccount(username: string) {
  try {
    localStorage.setItem(storageKey, username.toLowerCase())
  } catch {
    // Storage blocked (private mode): the account simply starts from the hub
  }
}

/** True once, at the first login of the account registered on this device. */
export function takeNewAccount(username: string) {
  try {
    if (localStorage.getItem(storageKey) !== username.toLowerCase()) return false
    localStorage.removeItem(storageKey)
    return true
  } catch {
    return false
  }
}
