import { LoginForm } from '@/shared/components/LoginForm'
import { useLogin } from '@/shared/hooks/useLogin'

/** Log in screen. */
export function AuthLoginPage() {
  const login = useLogin()

  return (
    <section>
      <title>Log in – Will of the Void</title>
      <h1>Log in</h1>
      <LoginForm {...login} />
    </section>
  )
}
