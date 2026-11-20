import { useCallback } from 'react'
import { useParams } from 'react-router'
import { ApiPage } from '@/shared/components/ApiPage'
import { communityService } from '../api/community'

/** Summoner screen. */
export function CommunitySummonerPage() {
  const { username = '' } = useParams()
  const load = useCallback((signal: AbortSignal) => communityService.getSummoner(username, signal), [username])

  return (
    <ApiPage title="Summoner" load={load}>
      {(profile) => (
        <p>
          {profile.username} · {profile.trophies} trophies
        </p>
      )}
    </ApiPage>
  )
}
