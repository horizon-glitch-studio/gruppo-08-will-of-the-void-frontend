import { LoginForm } from '@/shared/components/LoginForm'
import { useLogin } from '@/shared/hooks/useLogin'

/** Administrator login screen. */
export function AuthLoginPage() {
  const login = useLogin('ADMIN')

  return (
    <main>
      <title>Admin log in – Will of the Void</title>
      <h1>Admin log in</h1>
      <LoginForm {...login} />
    </main>
  )
}
