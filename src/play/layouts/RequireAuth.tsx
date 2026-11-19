import { Outlet } from 'react-router'

/**
 * Guard for the screens that need a logged-in Summoner.
 *
 * TODO: when the API client and the session exist, redirect to the login screen
 * if there is no valid session, keeping the requested path to return to it after login.
 * Until then it lets every route through.
 */
export function RequireAuth() {
  return <Outlet />
}
