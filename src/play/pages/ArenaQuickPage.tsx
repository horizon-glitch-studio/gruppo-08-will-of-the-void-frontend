import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { arenaService } from '@/play/api/arena'
import { decksService } from '@/play/api/decks'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { paths } from '../routes/paths'

/** Quick match screen. */
export function ArenaQuickPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  // REVISIONE PM: il mazzo scelto in /arena arriva da location.state; se si ricarica la pagina si perde e si usa il primo mazzo valido. Alternativa: ?deck= nell'URL.
  const [chosenId, setChosenId] = useState<unknown>(state?.deckId)
  const [sentTo, setSentTo] = useState<string>()
  const [now, setNow] = useState(Date.now)

  // REVISIONE PM: timer a 1 secondo per il conto alla rovescia del refresh (evita Date.now() nel render, regola lint purity).
  // REVISIONE PM: il timer continua a far ri-renderizzare la pagina anche a cooldown finito. Va bene ora, ottimizzabile dopo.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const load = useCallback(async (signal: AbortSignal) => {
    const [list, decks] = await Promise.all([arenaService.listOpponents('QUICK', signal), decksService.list(signal)])
    return { list, decks }
  }, [])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  // REVISIONE PM: dopo il refresh ricarico la lista salvata sul server (MODE-09), non uso la risposta del POST.
  const refresh = useApiAction(async () => {
    await arenaService.refreshOpponents('QUICK')
    reload()
  })

  // REVISIONE PM: errore OPPONENT_ALREADY_ATTACKED non presente in src/shared/api/error-message.ts: l'utente vede il messaggio generico. File condiviso, non modificato.
  // REVISIONE PM: attack riceve entry.opponent.id come nel doc (POST /matchmaking/opponents/{opponentId}/battle). Il service lo chiama solo "id": confermare con il backend che sia l'id giusto.
  const attack = useApiAction(async (opponentId: number, username: string, deckId: number) => {
    setSentTo(undefined)
    const battle = await arenaService.attack(opponentId, 'QUICK', deckId)
    // REVISIONE PM: PLAYED = partita istantanea, PENDING = sfida in attesa (avversario senza difesa valida).
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
      <h2 id="quick-opponents">Quick opponents</h2>
      <p>Five random Summoners active within the last 7 days. This list stays the same on page reload.</p>

      {deck ? (
        <p className="column gap-3xs">
          <label htmlFor="quick-deck">Your deck</label>
          <select id="quick-deck" value={deck.id} onChange={(event) => setChosenId(Number(event.target.value))}>
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

      <ul className="list-plain column gap-s">
        {data.list.opponents.map((entry) => (
          <li key={entry.opponent.id}>
            <Panel as="div" tone="arena" className="column gap-s">
              <h3>{entry.opponent.username}</h3>
              {/* REVISIONE PM: dati mancanti rispetto al Figma (gap G4). Il Figma mostra "Valid defense · 1/3 attacks today",
                  "No valid defense · Challenge required" e "Daily limit reached · Try again in 23h".
                  L'API (OpponentList) non ha né "difesa valida" né il contatore attacchi, ha solo "attacked": non li invento.
                  Da chiedere al backend. Per lo stesso motivo c'è un solo pulsante "Play Quick" (il Figma ha anche "Send Quick challenge"):
                  la scelta tra partita istantanea e sfida la fa il server. */}
              {/* REVISIONE PM: "Ready to play" e "Already attacked in this list" sono testi miei, non del Figma. Da validare con il design. */}
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
            </Panel>
          </li>
        ))}
      </ul>

      {attack.errorMessage && <ErrorBox message={attack.errorMessage} />}

      <div className="column gap-s">
        <Button tone="arena" disabled={busy || secondsLeft > 0} onClick={() => void refresh.run()}>
          {refresh.pending ? 'The Void is searching…' : 'Refresh opponents'}
        </Button>
        {/* REVISIONE PM: stato "Refreshing opponents" del Figma: cooldown di 5 secondi (MODE-11), la lista precedente resta visibile. */}
        {secondsLeft > 0 && <output>Refresh available in {secondsLeft} seconds</output>}
        {refresh.errorMessage && <ErrorBox message={refresh.errorMessage} />}
      </div>
    </section>
  )
}
