import { useCallback, useEffect } from 'react'
import { useParams } from 'react-router'
import { arenaService } from '@/play/api/arena'
import { ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { Stat } from '@/shared/components/Stat'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { paths } from '../routes/paths'

const modeLabel = { FRIEND: 'Friend', QUICK: 'Quick', RANKED: 'Ranked' } as const
const verdict = { WIN: 'The Void remembers your victory', LOSS: 'The Void remembers your defeat', DRAW: 'The Void remembers a draw' } as const

/**
 * Readable end reasons. The backend codes are not documented yet: the rules know two endings, the win threshold (MATCH-12) and deck exhaustion (MATCH-13 to 16).
 * Add each code here once the backend confirms it; until then the code itself is shown in plain words (DECK_EXHAUSTED → "Deck exhausted").
 */
const endReasonLabel: Record<string, string> = {}

function formatEndReason(reason: string | null) {
  if (!reason) return '–'
  const words = reason.toLowerCase().replaceAll('_', ' ')
  return endReasonLabel[reason] ?? words.charAt(0).toUpperCase() + words.slice(1)
}

/** Battle result screen. */
export function ArenaBattlePage() {
  const { battleId = '' } = useParams()
  const { user, reload: reloadUser } = useCurrentUser()

  const load = useCallback((signal: AbortSignal) => arenaService.result(battleId, signal), [battleId])
  const { status, data: result, errorMessage, reload } = useApiQuery(load)

  const ranked = status === 'success' && result.mode === 'RANKED'

  useEffect(() => {
    if (ranked) void reloadUser()
  }, [ranked, reloadUser])

  if (status === 'loading') return <output>Loading…</output>
  if (status === 'error') return <ErrorBox message={errorMessage} onRetry={reload} />

  const isChallenger = result.challenger.player.id === user.id
  const mine = isChallenger ? result.challenger : result.opponent
  const theirs = isChallenger ? result.opponent : result.challenger
  const outcome = result.outcome === 'DRAW' ? 'DRAW' : (result.outcome === 'CHALLENGER_WIN') === isChallenger ? 'WIN' : 'LOSS'
  const delta = mine.trophiesDelta

  return (
    <section aria-labelledby="battle-verdict" className="column gap-m">
      <Panel as="div" tone="arena">
        <div className="column gap-s">
          <h2 id="battle-verdict" className="h3">
            {verdict[outcome]}
          </h2>
          <dl className="column gap-2xs">
            <dt>Opponent</dt>
            <dd>{theirs.player.username}</dd>
            <dt>Mode</dt>
            <dd>{modeLabel[result.mode]}</dd>
            <dt>Win reason</dt>
            <dd>{formatEndReason(result.endReason)}</dd>
            <dt>Trophies</dt>
            <dd>{ranked && delta !== null ? (delta > 0 ? `+${delta}` : delta) : 'No change'}</dd>
            <dt>Match rewards</dt>
            <dd>{ranked ? 'Season participation recorded' : 'No Shards or Trophies'}</dd>
          </dl>
          <div className="row gap-m">
            <Stat label="Your Energy" value={mine.energy} />
            <Stat label="Opponent Energy" value={theirs.energy} />
          </div>
          <p>Both Summoners started at 0 Energy. The server shuffled and simulated the match without player decisions.</p>
        </div>
      </Panel>
      <div className="column gap-s">
        <ButtonLink to={paths.replay(battleId)} variant="primary" tone="arena">
          Watch replay
        </ButtonLink>
        {/* Rematch: not available yet, so no button until it exists */}
        {ranked && (
          <ButtonLink to={paths.leaderboard} tone="arena">
            View leaderboard
          </ButtonLink>
        )}
        <ButtonLink to={paths.battleHistory} tone="arena">
          Match history
        </ButtonLink>
      </div>
    </section>
  )
}
