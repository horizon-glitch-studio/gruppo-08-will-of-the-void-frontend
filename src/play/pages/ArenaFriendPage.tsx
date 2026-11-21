import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { arenaService } from '@/play/api/arena'
import { communityService } from '@/play/api/community'
import { decksService } from '@/play/api/decks'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { paths } from '../routes/paths'

/** Friend match screen. */
export function ArenaFriendPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [sentTo, setSentTo] = useState<string>()

  const load = useCallback(async (signal: AbortSignal) => {
    const [friends, decks] = await Promise.all([communityService.listFriends(), decksService.list(signal)])
    return { friends, decks }
  }, [])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  const challenge = useApiAction(async (username: string, deckId: number) => {
    setSentTo(undefined)
    const battle = await arenaService.challengeFriend(username, deckId)
    if (battle.status === 'PLAYED') await navigate(paths.battle(battle.id))
    else setSentTo(username)
  })

  if (status === 'loading') return <output>Loading…</output>
  if (status === 'error') return <ErrorBox message={errorMessage} onRetry={reload} />

  const validDecks = data.decks.filter((deck) => deck.status === 'VALID')
  const stateDeckId: unknown = state?.deckId
  const deck = validDecks.find((item) => item.id === stateDeckId) ?? validDecks[0]

  return (
    <section aria-labelledby="friend-list" className="column gap-m">
      <h2 id="friend-list">Choose a friend</h2>

      {!deck && <ErrorBox message="You have no valid deck. Fix or create a deck to play." />}

      {data.friends.length === 0 ? (
        <p>You have no friends yet.</p>
      ) : (
        <ul className="list-plain column gap-s">
          {data.friends.map((friend) => (
            <li key={friend.id}>
              <Panel as="div" tone="arena" className="column gap-s">
                <h3>{friend.username}</h3>
                <p>{friend.online ? 'Online' : 'Offline'}</p>
                <Button tone="arena" disabled={!deck || challenge.pending} onClick={() => deck && void challenge.run(friend.username, deck.id)}>
                  {challenge.pending ? 'Please wait…' : 'Challenge'}
                </Button>
                {sentTo === friend.username && <output>Challenge sent. Waiting for {friend.username} to accept.</output>}
              </Panel>
            </li>
          ))}
        </ul>
      )}

      {challenge.errorMessage && <ErrorBox message={challenge.errorMessage} />}

      <ButtonLink to={paths.challenges} tone="arena">
        Pending challenges
      </ButtonLink>
    </section>
  )
}
