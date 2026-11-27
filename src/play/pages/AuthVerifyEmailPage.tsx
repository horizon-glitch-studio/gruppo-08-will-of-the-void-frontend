import { AuthScreen } from '../components/AuthScreen'
import { PagePlaceholder } from '../components/PagePlaceholder'

/** Verify email screen. Heading and tab title from AuthScreen, like the other account access screens. */
export function AuthVerifyEmailPage() {
  return (
    <AuthScreen title="Verify your email" backToLogin>
      <PagePlaceholder />
    </AuthScreen>
  )
}
