import { useCallback } from 'react'
import { useParams } from 'react-router'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { communityService } from '../api/community'

/** Summoner screen. */
export function CommunitySummonerPage() {
  const { username = '' } = useParams()
  const load = useCallback((signal: AbortSignal) => communityService.getSummoner(username, signal), [username])

  const { status, data, errorMessage, reload } = useApiQuery(load)

  return (
    <section>
      <title>Summoner – Will of the Void</title>
      <h1>Summoner</h1>
      {status === 'loading' && <output>Loading…</output>}
      {status === 'error' && <ErrorBox message={errorMessage} onRetry={reload} />}
      {status === 'success' && (
        <p>
          {data.username} · {data.trophies} trophies
        </p>
      )}
    </section>
  )
}
