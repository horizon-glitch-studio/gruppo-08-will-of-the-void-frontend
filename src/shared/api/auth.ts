import { apiRequest, replaceSessionTokens, revokeSession, setSession, type Tokens } from './client'

export type PlayerRole = 'USER' | 'ADMIN'

/** A Shard bonus: granted is false when it was already given (daily) or not due (comeback). */
export interface Bonus {
  granted: boolean
  amount: number
}

/** The daily bonus and the bonus for coming back after an absence. */
export interface LoginBonuses {
  dailyBonus: Bonus
  comebackBonus: Bonus
}

interface LoginResult extends Tokens, LoginBonuses {
  player: { id: number; username: string; role: PlayerRole; emailVerified: boolean }
}

export interface Registration {
  username: string
  email: string
  password: string
  timezone: string
  inviteCode?: string
}

interface Registered {
  id: number
  username: string
  email: string
  emailVerified: boolean
}

/** Account endpoints shared by the game and backoffice. */
export const authService = {
  async login(identifier: string, password: string, requiredRole?: PlayerRole) {
    const result = await apiRequest<LoginResult>('/auth/login', { method: 'POST', json: { identifier, password } })
    if (requiredRole && result.player.role !== requiredRole) {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${result.accessToken}` },
        json: { refreshToken: result.refreshToken },
      })
    } else {
      setSession(result)
    }
    return result
  },
  logout: revokeSession,
  /**
   * Logs in again on this device, inside the same session: after a password change, which revokes every refresh token.
   * The pages stay open. If the login fails, the session ends and the player logs in with the new password.
   */
  async renewSession(identifier: string, password: string) {
    try {
      replaceSessionTokens(await apiRequest<LoginResult>('/auth/login', { method: 'POST', json: { identifier, password } }))
    } catch (error) {
      setSession(null)
      throw error
    }
  },
  register: (json: Registration) => apiRequest<Registered>('/auth/register', { method: 'POST', json }),
  verifyEmail: (token: string) => apiRequest<void>('/auth/verify-email', { method: 'POST', json: { token } }),
  resendVerification: () => apiRequest<void>('/auth/resend-verification', { method: 'POST', authenticated: true }),
  forgotPassword: (email: string) => apiRequest<void>('/auth/forgot-password', { method: 'POST', json: { email } }),
  resetPassword: (token: string, newPassword: string) => apiRequest<void>('/auth/reset-password', { method: 'POST', json: { token, newPassword } }),
  /** Grants the bonuses that are due. Called when the app opens with a session already active: login grants them on its own. */
  claimDailyBonus: () => apiRequest<LoginBonuses>('/auth/daily-bonus', { method: 'POST', authenticated: true }),
}
