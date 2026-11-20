import { LoginForm } from '@/shared/components/LoginForm'

/** Administrator login screen. */
export function AuthLoginPage() {
  return (
    <main>
      <title>Admin log in – Will of the Void</title>
      <h1>Admin log in</h1>
      <LoginForm requiredRole="ADMIN" />
    </main>
  )
}
