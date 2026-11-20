import { usersService } from '@/shared/api/users'
import { ApiPage } from '@/shared/components/ApiPage'

/** Profile screen. */
export function ProfilePage() {
  return (
    <ApiPage title="Profile" load={usersService.getMe}>
      {(profile) => (
        <p>
          {profile.username} · {profile.trophies} trophies
        </p>
      )}
    </ApiPage>
  )
}
