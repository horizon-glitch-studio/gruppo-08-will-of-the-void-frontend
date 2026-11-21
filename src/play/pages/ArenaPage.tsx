import { useState } from 'react'
import { decksService } from '@/play/api/decks'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { DeckSelect } from '../components/DeckSelect'
import { useDeckParam, withDeck } from '../hooks/useDeckParam'
import { paths } from '../routes/paths'

function remaining(until: Date, now: number) {
  const minutes = Math.max(0, Math.ceil((until.getTime() - now) / 60000))
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** Arena screen: choose the attacking deck and a match mode. */
export function ArenaPage() {
  const { user } = useCurrentUser()
  const { status, data: decks, errorMessage, reload } = useApiQuery(decksService.list)
  const [chosenId, setChosenId] = useDeckParam()
  const [now] = useState(Date.now)

  if (status === 'loading') return <output>Loading…</output>
  if (status === 'error') return <ErrorBox message={errorMessage} onRetry={reload} />

  const validDecks = decks.filter((deck) => deck.status === 'VALID')
  const deck = validDecks.find((item) => item.id === chosenId) ?? validDecks[0]
  const defense = decks.find((item) => item.isDefenseDeck)
  const rankedReady = defense?.status === 'VALID'
  const shieldUntil = user.protectedUntil ? new Date(user.protectedUntil) : null
  const shielded = shieldUntil !== null && shieldUntil.getTime() > now

  return (
    <section aria-labelledby="arena-modes" className="column gap-m">
      <h2 id="arena-modes" className="h3">
        Choose a match mode
      </h2>

      {deck ? <DeckSelect label="Your attacking deck" decks={validDecks} value={deck.id} onChange={setChosenId} /> : <ErrorBox message="You have no valid deck. Fix or create a deck to play." />}

      <Panel as="section" tone="arena" aria-labelledby="mode-friend">
        <div className="column gap-s">
          <h3 id="mode-friend" className="h4">
            Friend
          </h3>
          <p>Against a friend · 30 Energy to win · No Trophies or rewards</p>
          {deck ? (
            <ButtonLink to={withDeck(paths.arenaFriend, deck.id)} tone="arena">
              Choose friend
            </ButtonLink>
          ) : (
            <Button tone="arena" disabled>
              Choose friend
            </Button>
          )}
        </div>
      </Panel>

      <Panel as="section" tone="arena" aria-labelledby="mode-quick">
        <div className="column gap-s">
          <h3 id="mode-quick" className="h4">
            Quick
          </h3>
          <p>Random recently active opponents · 20 Energy to win · No Trophies or rewards</p>
          {deck ? (
            <ButtonLink to={withDeck(paths.arenaQuick, deck.id)} tone="arena">
              Find Quick opponents
            </ButtonLink>
          ) : (
            <Button tone="arena" disabled>
              Find Quick opponents
            </Button>
          )}
        </div>
      </Panel>

      <Panel as="section" tone="arena" aria-labelledby="mode-ranked">
        <div className="column gap-s">
          <h3 id="mode-ranked" className="h4">
            Ranked
          </h3>
          <p>Similar Trophies · 30 Energy to win · Valid defense required</p>
          {rankedReady && deck ? (
            <ButtonLink to={withDeck(paths.arenaRanked, deck.id)} tone="arena">
              Find Ranked opponents
            </ButtonLink>
          ) : (
            <>
              <Button tone="arena" disabled>
                Find Ranked opponents
              </Button>
              <p>Your Ship needs a defense. Set a valid defense deck before attacking or being attacked in Ranked. A departed Wanderer or traded copy can invalidate your defense.</p>
              <ButtonLink to={paths.decks} tone="arena">
                Fix or replace defense
              </ButtonLink>
            </>
          )}
          {shielded && shieldUntil && <p>Ranked shield active: {remaining(shieldUntil, now)} remaining. Starting a Ranked attack ends this protection.</p>}
        </div>
      </Panel>
    </section>
  )
}
