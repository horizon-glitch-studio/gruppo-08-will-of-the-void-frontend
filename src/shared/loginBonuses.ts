import type { LoginBonuses } from './api/auth'

/*
 * Bonuses granted by the last login, kept in memory until the platform shows them.
 * The login grants them on its own, so a call to /auth/daily-bonus right after would answer "already given".
 * Memory only: a reload loses them, and the next opening claims what is due.
 */
let fromLogin: LoginBonuses | null = null

/** Keeps the bonuses of the login response for the platform notice. */
export function rememberLoginBonuses(bonuses: LoginBonuses) {
  fromLogin = { dailyBonus: bonuses.dailyBonus, comebackBonus: bonuses.comebackBonus }
}

/** The bonuses of the last login, once: null if there was no login since the page loaded, or they were already taken. */
export function takeLoginBonuses() {
  const bonuses = fromLogin
  fromLogin = null
  return bonuses
}
