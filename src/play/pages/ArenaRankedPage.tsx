import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { arenaService } from '@/play/api/arena'
import { decksService } from '@/play/api/decks'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { DeckSelect } from '../components/DeckSelect'
import { useDeckParam, withDeck } from '../hooks/useDeckParam'
import { paths } from '../routes/paths'

/** Ranked match screen: shield warning, defense check, then opponents with similar Trophies. */
export function ArenaRankedPage() {
  const navigate = useNavigate()
  const { user, reload: reloadUser } = useCurrentUser()
  const [chosenId, setChosenId] = useDeckParam()
  const [shieldAccepted, setShieldAccepted] = useState(false)
  const [now, setNow] = useState(Date.now)

  // Clock for the refresh and shield countdowns (Date.now() is not allowed during render)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const shieldUntil = user.protectedUntil ? new Date(user.protectedUntil) : null
  const shielded = shieldUntil !== null && shieldUntil.getTime() > now

  // Without a valid defense the list is not loaded: the server would refuse it (MODE-15)
  const load = useCallback(async (signal: AbortSignal) => {
    const decks = await decksService.list(signal)
    const defense = decks.find((item) => item.isDefenseDeck)
    const list = defense?.status === 'VALID' ? await arenaService.listOpponents('RANKED', signal) : undefined
    return { decks, defense, list }
  }, [])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  // After a refresh, load the list the server saved (MODE-09) instead of using the POST response
  const refresh = useApiAction(async () => {
    await arenaService.refreshOpponents('RANKED')
    reload()
  })

  const setDefense = useApiAction(async (deckId: number) => {
    await decksService.setDefense(deckId)
    reload()
  })

  const attack = useApiAction(async (opponentId: number, deckId: number) => {
    const battle = await arenaService.attack(opponentId, 'RANKED', deckId)
    // A Ranked battle changes the Trophies and ends the shield (MODE-21): refresh the top bar
    await reloadUser()
    await navigate(paths.battle(battle.id))
  })

  if (status === 'loading') return <output>Loading…</output>
  if (status === 'error') return <ErrorBox message={errorMessage} onRetry={reload} />

  const validDecks = data.decks.filter((item) => item.status === 'VALID')
  const deck = validDecks.find((item) => item.id === chosenId) ?? validDecks[0]
  const busy = attack.pending || refresh.pending || setDefense.pending

  if (shielded && shieldUntil && !shieldAccepted) {
    const minutes = Math.max(0, Math.ceil((shieldUntil.getTime() - now) / 60000))
    return (
      <section aria-labelledby="ranked-shield" className="column gap-m">
        <h2 id="ranked-shield" className="h3">
          Protection after repeated attacks
        </h2>
        <p>Receiving 5 Ranked attacks within 24 hours grants a 12 hour shield. You cannot be attacked in Ranked or appear in new Ranked lists while protected.</p>
        <p>Attacking in Ranked ends your shield immediately. Friend and Quick neither start nor end it.</p>
        <Panel as="div" tone="arena">
          <div className="column gap-2xs">
            <h3 className="h4">Active shield</h3>
            <p>
              {Math.floor(minutes / 60)}h {minutes % 60}m remaining. Starting a Ranked attack ends this protection.
            </p>
          </div>
        </Panel>
        <div className="column gap-s">
          <Button tone="arena" onClick={() => setShieldAccepted(true)}>
            End shield and view Ranked
          </Button>
          <ButtonLink to={withDeck(paths.arenaQuick, deck?.id)} tone="arena">
            Play Quick without ending shield
          </ButtonLink>
        </div>
      </section>
    )
  }

  if (!data.list) {
    return (
      <section aria-labelledby="ranked-unavailable" className="column gap-m">
        <h2 id="ranked-unavailable" className="h3">
          Ranked unavailable
        </h2>
        <Panel as="div" tone="arena">
          <div className="column gap-s">
            <h3 className="h4">Your Ship needs a defense</h3>
            <p>Set a valid defense deck before attacking or being attacked in Ranked. A departed Wanderer or traded copy can invalidate your defense.</p>
          </div>
        </Panel>
        <div className="column gap-s">
          <ButtonLink to={paths.decks} tone="arena">
            Fix or replace defense
          </ButtonLink>
          <Button tone="arena" disabled={!validDecks[0] || busy} onClick={() => validDecks[0] && void setDefense.run(validDecks[0].id)}>
            {validDecks[0] ? `Use ${validDecks[0].name} as defense` : 'No valid deck to defend with'}
          </Button>
        </div>
        {setDefense.errorMessage && <ErrorBox message={setDefense.errorMessage} />}
      </section>
    )
  }

  const secondsLeft = Math.max(0, Math.ceil((new Date(data.list.refreshAvailableAt).getTime() - now) / 1000))

  return (
    <section aria-labelledby="ranked-opponents" className="column gap-m">
      <h2 id="ranked-opponents" className="h3">
        Ranked opponents
      </h2>
      <p>
        {data.list.opponents.length} Summoners · {user.trophies} Trophies. All have valid defenses and no active shield.
      </p>

      {deck ? (
        <div className="column gap-s">
          <DeckSelect label="Attacking deck" decks={validDecks} value={deck.id} onChange={setChosenId} />
          <p>Active defense: {data.defense?.name}</p>
        </div>
      ) : (
        <ErrorBox message="You have no valid deck. Fix or create a deck to play." />
      )}

      <ul className="list-plain column gap-s">
        {data.list.opponents.map((entry) => (
          <li key={entry.opponent.id}>
            <Panel as="div" tone="arena">
              <div className="column gap-s">
                <h3 className="h4">{entry.opponent.username}</h3>
                <p>{entry.trophiesAtGeneration} Trophies · Valid defense · No shield</p>
                <p>Orbit {entry.orbit}</p>
                <Button tone="arena" disabled={!deck || busy || entry.attacked} onClick={() => deck && void attack.run(entry.opponent.id, deck.id)}>
                  {entry.attacked ? 'Already attacked' : 'Attack in Ranked'}
                </Button>
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
