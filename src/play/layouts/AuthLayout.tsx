import { Outlet } from 'react-router'

/** Layout of the account access screens (login, register, password, email verification): no top bar. */
export function AuthLayout() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
