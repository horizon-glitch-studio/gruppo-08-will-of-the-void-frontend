import { useState } from 'react'
import { decksService } from '@/play/api/decks'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { paths } from '../routes/paths'

function remaining(until: Date, now: number) {
  const minutes = Math.max(0, Math.ceil((until.getTime() - now) / 60000))
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** Arena screen. */
export function ArenaPage() {
  const { user } = useCurrentUser()
  const { status, data: decks, errorMessage, reload } = useApiQuery(decksService.list)
  const [chosenId, setChosenId] = useState<number>()
  const [now] = useState(Date.now)

  if (status === 'loading') return <output>Loading…</output>
  if (status === 'error') return <ErrorBox message={errorMessage} onRetry={reload} />

  const validDecks = decks.filter((deck) => deck.status === 'VALID')
  const deck = validDecks.find((item) => item.id === chosenId) ?? validDecks[0]
  const defense = decks.find((item) => item.isDefenseDeck)
  const rankedReady = defense?.status === 'VALID'
  const shieldUntil = user.protectedUntil ? new Date(user.protectedUntil) : null
  const shielded = shieldUntil !== null && shieldUntil.getTime() > now
  const state = deck ? { deckId: deck.id } : undefined

  return (
    <section aria-labelledby="arena-modes" className="column gap-m">
      <h2 id="arena-modes">Choose a match mode</h2>

      {deck ? (
        <p className="column gap-3xs">
          <label htmlFor="attacking-deck">Your attacking deck</label>
          <select id="attacking-deck" value={deck.id} onChange={(event) => setChosenId(Number(event.target.value))}>
            {validDecks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </p>
      ) : (
        <ErrorBox message="You have no valid deck. Fix or create a deck to play." />
      )}

      <Panel as="section" tone="arena" className="column gap-s" aria-labelledby="mode-friend">
        <h3 id="mode-friend">Friend</h3>
        <p>Against a friend · 30 Energy to win · No Trophies or rewards</p>
        {deck ? (
          <ButtonLink to={paths.arenaFriend} state={state} tone="arena">
            Choose friend
          </ButtonLink>
        ) : (
          <Button tone="arena" disabled>
            Choose friend
          </Button>
        )}
      </Panel>

      <Panel as="section" tone="arena" className="column gap-s" aria-labelledby="mode-quick">
        <h3 id="mode-quick">Quick</h3>
        <p>Random recently active opponents · 20 Energy to win · No Trophies or rewards</p>
        {deck ? (
          <ButtonLink to={paths.arenaQuick} state={state} tone="arena">
            Find Quick opponents
          </ButtonLink>
        ) : (
          <Button tone="arena" disabled>
            Find Quick opponents
          </Button>
        )}
      </Panel>

      <Panel as="section" tone="arena" className="column gap-s" aria-labelledby="mode-ranked">
        <h3 id="mode-ranked">Ranked</h3>
        <p>Similar Trophies · 30 Energy to win · Valid defense required</p>
        {rankedReady && deck ? (
          <ButtonLink to={paths.arenaRanked} state={state} tone="arena">
            Find Ranked opponents
          </ButtonLink>
        ) : (
          <>
            <Button tone="arena" disabled>
              Find Ranked opponents
            </Button>
            <output>Your Ship needs a defense. Set a valid defense deck before attacking or being attacked in Ranked. A departed Wanderer or traded copy can invalidate your defense.</output>
            <ButtonLink to={paths.decks} tone="arena">
              Fix or replace defense
            </ButtonLink>
          </>
        )}
        {shielded && shieldUntil && <output>Ranked shield active: {remaining(shieldUntil, now)} remaining. Starting a Ranked attack ends this protection.</output>}
      </Panel>
    </section>
  )
}
