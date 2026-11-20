import { apiRequest, revokeSession, setSession, type Tokens } from './client'

export type PlayerRole = 'USER' | 'ADMIN'

interface LoginResult extends Tokens {
  player: { id: number; username: string; role: PlayerRole; emailVerified: boolean }
  dailyBonus: { granted: boolean; amount: number }
  comebackBonus: { granted: boolean; amount: number }
}

interface Registration {
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
  register: (json: Registration) => apiRequest<Registered>('/auth/register', { method: 'POST', json }),
  verifyEmail: (token: string) => apiRequest<void>('/auth/verify-email', { method: 'POST', json: { token } }),
  resendVerification: () => apiRequest<void>('/auth/resend-verification', { method: 'POST', authenticated: true }),
  forgotPassword: (email: string) => apiRequest<void>('/auth/forgot-password', { method: 'POST', json: { email } }),
  resetPassword: (token: string, newPassword: string) => apiRequest<void>('/auth/reset-password', { method: 'POST', json: { token, newPassword } }),
}
