import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { arenaService } from '@/play/api/arena'
import { decksService } from '@/play/api/decks'
import { Button, ButtonLink } from '@/shared/components/Button'
import { ErrorBox } from '@/shared/components/ErrorBox'
import { Panel } from '@/shared/components/Panel'
import { useApiAction } from '@/shared/hooks/useApiAction'
import { useApiQuery } from '@/shared/hooks/useApiQuery'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { paths } from '../routes/paths'

/** Ranked match screen. */
export function ArenaRankedPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, reload: reloadUser } = useCurrentUser()
  // REVISIONE PM: il mazzo scelto in /arena arriva da location.state; se si ricarica la pagina si perde e si usa il primo mazzo valido. Alternativa: ?deck= nell'URL.
  const [chosenId, setChosenId] = useState<unknown>(state?.deckId)
  const [shieldAccepted, setShieldAccepted] = useState(false)
  const [now, setNow] = useState(Date.now)

  // REVISIONE PM: timer a 1 secondo per i conti alla rovescia (refresh e scudo), evita Date.now() nel render (regola lint purity).
  // REVISIONE PM: il timer continua a far ri-renderizzare la pagina anche a cooldown finito. Ottimizzabile dopo.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const shieldUntil = user.protectedUntil ? new Date(user.protectedUntil) : null
  const shielded = shieldUntil !== null && shieldUntil.getTime() > now

  // REVISIONE PM: se la difesa non e' valida o lo scudo e' attivo, la lista non viene caricata: il server potrebbe rifiutarla (MODE-15) e il Figma mostra una schermata dedicata.
  const load = useCallback(async (signal: AbortSignal) => {
    const decks = await decksService.list(signal)
    const defense = decks.find((item) => item.isDefenseDeck)
    const list = defense?.status === 'VALID' ? await arenaService.listOpponents('RANKED', signal) : undefined
    return { decks, defense, list }
  }, [])
  const { status, data, errorMessage, reload } = useApiQuery(load)

  // REVISIONE PM: dopo il refresh ricarico la lista salvata sul server (MODE-09), non uso la risposta del POST.
  const refresh = useApiAction(async () => {
    await arenaService.refreshOpponents('RANKED')
    reload()
  })

  // REVISIONE PM: "Use valid starter defense" del Figma: il mazzo iniziale non e' identificabile dall'API (nessun flag "starter"), quindi imposto come difesa il primo mazzo valido. Da confermare con il design e il backend.
  const setDefense = useApiAction(async (deckId: number) => {
    await decksService.setDefense(deckId)
    reload()
  })

  // REVISIONE PM: errori OPPONENT_ALREADY_ATTACKED e DEFENSE_DECK_INVALID non presenti in src/shared/api/error-message.ts: l'utente vede il messaggio generico. File condiviso, non modificato.
  // REVISIONE PM: attack riceve entry.opponent.id come nel doc (POST /matchmaking/opponents/{opponentId}/battle). Il service lo chiama solo "id": confermare con il backend che sia l'id giusto.
  const attack = useApiAction(async (opponentId: number, deckId: number) => {
    const battle = await arenaService.attack(opponentId, 'RANKED', deckId)
    // REVISIONE PM: dopo una Ranked i trofei cambiano e lo scudo finisce (MODE-21): aggiorno il giocatore per la barra in alto.
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
        <h2 id="ranked-shield">Protection after repeated attacks</h2>
        <p>Receiving 5 Ranked attacks within 24 hours grants a 12 hour shield. You cannot be attacked in Ranked or appear in new Ranked lists while protected.</p>
        <p>Attacking in Ranked ends your shield immediately. Friend and Quick neither start nor end it.</p>
        <Panel as="div" tone="arena" className="column gap-2xs">
          <h3>Active shield</h3>
          <p>
            {Math.floor(minutes / 60)}h {minutes % 60}m remaining. Starting a Ranked attack ends this protection.
          </p>
        </Panel>
        <div className="column gap-s">
          <Button tone="arena" onClick={() => setShieldAccepted(true)}>
            End shield and view Ranked
          </Button>
          <ButtonLink to={paths.arenaQuick} state={deck ? { deckId: deck.id } : undefined} tone="arena">
            Play Quick without ending shield
          </ButtonLink>
        </div>
      </section>
    )
  }

  if (!data.list) {
    return (
      <section aria-labelledby="ranked-unavailable" className="column gap-m">
        <h2 id="ranked-unavailable">Ranked unavailable</h2>
        <Panel as="div" tone="arena" className="column gap-s">
          <h3>Your Ship needs a defense</h3>
          <p>Set a valid defense deck before attacking or being attacked in Ranked. A departed Wanderer or traded copy can invalidate your defense.</p>
        </Panel>
        <div className="column gap-s">
          <ButtonLink to={paths.decks} tone="arena">
            Fix or replace defense
          </ButtonLink>
          <Button tone="arena" disabled={!validDecks[0] || busy} onClick={() => validDecks[0] && void setDefense.run(validDecks[0].id)}>
            Use valid starter defense
          </Button>
        </div>
        {setDefense.errorMessage && <ErrorBox message={setDefense.errorMessage} />}
      </section>
    )
  }

  const secondsLeft = Math.max(0, Math.ceil((new Date(data.list.refreshAvailableAt).getTime() - now) / 1000))

  return (
    <section aria-labelledby="ranked-opponents" className="column gap-m">
      <h2 id="ranked-opponents">Ranked opponents</h2>
      {/* REVISIONE PM: il Figma dice "5 Summoners · 550 Trophies · Initial search range 450–650". L'API non espone il range di ricerca: mostro solo i trofei del giocatore e non invento l'intervallo. Da chiedere al backend. */}
      <p>
        {data.list.opponents.length} Summoners · {user.trophies} Trophies. All have valid defenses and no active shield.
      </p>

      {deck ? (
        <div className="column gap-s">
          <p className="column gap-3xs">
            <label htmlFor="ranked-attack-deck">Attacking deck</label>
            <select id="ranked-attack-deck" value={deck.id} onChange={(event) => setChosenId(Number(event.target.value))}>
              {validDecks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </p>
          {/* REVISIONE PM: nel Figma "Active defense" e' un selettore. Qui e' solo testo: cambiare la difesa si fa in /ship/decks (decksService.setDefense). Da decidere con il design. */}
          <p>Active defense: {data.defense?.name}</p>
        </div>
      ) : (
        <ErrorBox message="You have no valid deck. Fix or create a deck to play." />
      )}

      <ul className="list-plain column gap-s">
        {data.list.opponents.map((entry) => (
          <li key={entry.opponent.id}>
            <Panel as="div" tone="arena" className="column gap-s">
              <h3>{entry.opponent.username}</h3>
              {/* REVISIONE PM: il Figma mostra "Valid defense · No shield" per ogni avversario. Non c'e' un campo dedicato, ma le liste Ranked contengono solo avversari con difesa valida e senza scudo (MODE-15), quindi lo scrivo come testo fisso. Da confermare. */}
              <p>{entry.trophiesAtGeneration} Trophies · Valid defense · No shield</p>
              {/* REVISIONE PM: entry.orbit e' una stringa senza valori documentati (nomi delle Orbite [TBD] in ranking.md): la mostro cosi' com'e'. */}
              <p>Orbit {entry.orbit}</p>
              <Button tone="arena" disabled={!deck || busy || entry.attacked} onClick={() => deck && void attack.run(entry.opponent.id, deck.id)}>
                {entry.attacked ? 'Already attacked' : 'Attack in Ranked'}
              </Button>
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
