import { ApiError } from './client'

const messages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Check your username or email and password.',
  TOKEN_INVALID: 'Your session has expired. Log in again.',
  ACTION_TOKEN_INVALID: 'This link is invalid or has expired.',
  USERNAME_ALREADY_USED: 'That username is already in use.',
  EMAIL_ALREADY_USED: 'That email is already in use.',
  INVITE_CODE_INVALID: 'Check your invite code.',
  INSUFFICIENT_SHARDS: 'You do not have enough Shards.',
  EMAIL_NOT_VERIFIED: 'Verify your email to continue.',
  MATCHMAKING_COOLDOWN: 'Wait before refreshing the opponent list.',
  DECK_INVALID: 'Choose a valid deck.',
  NOT_FRIENDS: 'Friend matches are available between friends.',
  OPPONENT_ALREADY_ATTACKED: 'You already attacked this Summoner in this list.',
  DEFENSE_DECK_INVALID: 'This deck is not valid, so it cannot defend your Ship.',
  REPLAY_EXPIRED: 'This replay has expired.',
  VALIDATION_FAILED: 'Check the information you entered.',
  TIMEZONE_CHANGE_TOO_SOON: 'You changed your time zone less than 30 days ago. Try again later.',
}

const fieldMessages: Record<string, string> = {
  FIELD_REQUIRED: 'This field is required.',
  EMAIL_INVALID: 'Enter a valid email address.',
  USERNAME_TOO_SHORT: 'Use at least 3 characters.',
  USERNAME_TOO_LONG: 'Use at most 20 characters.',
  USERNAME_INVALID_CHARACTERS: 'Use letters, numbers, and underscores.',
  PASSWORD_TOO_SHORT: 'Use at least 8 characters.',
  PASSWORD_TOO_LONG: 'Choose a shorter password.',
  // Set by the frontend from INVALID_CREDENTIALS: wrongPasswordAsFieldError
  PASSWORD_WRONG: 'This password is not correct.',
  QUANTITY_INVALID: 'Enter a quantity of at least 1.',
  TIMEZONE_INVALID: 'Choose a time zone from the list.',
  AVATAR_INVALID: 'Choose an avatar from the list.',
}

/** Returns displayable field feedback for structured validation errors. */
export function apiFieldMessages(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !Array.isArray(error.fieldErrors)) return {}
  return Object.fromEntries(
    error.fieldErrors.flatMap((item: unknown) => {
      if (!item || typeof item !== 'object' || !('field' in item) || !('code' in item)) return []
      if (typeof item.field !== 'string' || typeof item.code !== 'string') return []
      const message = Object.hasOwn(fieldMessages, item.code) ? fieldMessages[item.code] : 'Check this value.'
      return [[item.field, message]]
    }),
  )
}

/** Maps stable API codes to user-facing text. */
export function apiErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'Could not complete the request. Try again.'
  if (error.code && Object.hasOwn(messages, error.code)) return messages[error.code]
  if (error.status === 403) return 'You do not have permission to do this.'
  if (error.status === 404) return 'This item could not be found.'
  if (error.status >= 500) return 'The service is temporarily unavailable. Try again.'
  return 'The request could not be completed. Check your information and try again.'
}

/**
 * The backend answers a wrong password with INVALID_CREDENTIALS, the login error, whose text speaks of username and email.
 * In a form that asks only for the password (settings), it belongs to that field: use it in a .catch() of the request.
 */
export function wrongPasswordAsFieldError(field: string) {
  return (error: unknown): never => {
    if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') throw new ApiError(401, { code: 'VALIDATION_FAILED', fieldErrors: [{ field, code: 'PASSWORD_WRONG' }] })
    throw error
  }
}
