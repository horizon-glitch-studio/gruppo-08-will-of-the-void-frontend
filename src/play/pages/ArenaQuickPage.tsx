import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { arenaService } from '@/play/api/arena'
import { decksService } from '@/play/api/decks'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { DeckSelect } from '../components/DeckSelect'
import { useDeckParam } from '../hooks/useDeckParam'
import { paths } from '../routes/paths'

/** Quick match screen: five random recently active opponents, attacked with the chosen deck. */
export function ArenaQuickPage() {
  const navigate = useNavigate()
  const [chosenId, setChosenId] = useDeckParam()
  const [sentTo, setSentTo] = useState<string>()
  const [now, setNow] = useState(Date.now)

  // Clock for the refresh countdown (Date.now() is not allowed during render)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const load = useCallback(async (signal: AbortSignal) => {
    const [list, decks] = await Promise.all([arenaService.listOpponents('QUICK', signal), decksService.list(signal)])
    return { list, decks }
  }, [])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  // After a refresh, load the list the server saved (MODE-09) instead of using the POST response
  const refresh = useApiAction(async () => {
    await arenaService.refreshOpponents('QUICK')
    reload()
  })

  // PLAYED: the match ran at once, show the result. PENDING: a challenge waits for the opponent (no valid defense)
  const attack = useApiAction(async (opponentId: number, username: string, deckId: number) => {
    setSentTo(undefined)
    const battle = await arenaService.attack(opponentId, 'QUICK', deckId)
    if (battle.status === 'PLAYED') await navigate(paths.battle(battle.id))
    else setSentTo(username)
  })

  if (status === 'loading') return <output>Loading…</output>
  if (status === 'error') return <ErrorBox message={errorMessage} onRetry={reload} />

  const validDecks = data.decks.filter((item) => item.status === 'VALID')
  const deck = validDecks.find((item) => item.id === chosenId) ?? validDecks[0]
  const secondsLeft = Math.max(0, Math.ceil((new Date(data.list.refreshAvailableAt).getTime() - now) / 1000))
  const busy = attack.pending || refresh.pending

  return (
    <section aria-labelledby="quick-opponents" className="column gap-m">
      <h2 id="quick-opponents" className="h3">
        Quick opponents
      </h2>
      <p>Five random Summoners active within the last 7 days. This list stays the same on page reload.</p>

      {deck ? <DeckSelect label="Your deck" decks={validDecks} value={deck.id} onChange={setChosenId} /> : <ErrorBox message="You have no valid deck. Fix or create a deck to play." />}

      <ul className="list-plain column gap-s">
        {data.list.opponents.map((entry) => (
          <li key={entry.opponent.id}>
            <Panel as="div" tone="arena">
              <div className="column gap-s">
                <h3 className="h4">{entry.opponent.username}</h3>
                <p>{entry.attacked ? 'Already attacked in this list' : 'Ready to play'}</p>
                <Button tone="arena" disabled={!deck || busy || entry.attacked} onClick={() => deck && void attack.run(entry.opponent.id, entry.opponent.username, deck.id)}>
                  Play Quick
                </Button>
                {sentTo === entry.opponent.username && <output>Challenge sent. Waiting for {entry.opponent.username} to accept.</output>}
                {entry.battleId !== null && (
                  <ButtonLink to={paths.battle(entry.battleId)} tone="arena">
                    View last match
                  </ButtonLink>
                )}
              </div>
            </Panel>
          </li>
        ))}
      </ul>

      {attack.errorMessage && <ErrorBox message={attack.errorMessage} />}

      <div className="column gap-s">
        <Button tone="arena" disabled={busy || secondsLeft > 0} onClick={() => void refresh.run()}>
          {refresh.pending ? 'The Void is searching…' : 'Refresh opponents'}
        </Button>
        {/* A paragraph, not an output: a live region would be read aloud every second */}
        {secondsLeft > 0 && <p>Refresh available in {secondsLeft} seconds</p>}
        {refresh.errorMessage && <ErrorBox message={refresh.errorMessage} />}
      </div>
    </section>
  )
}
