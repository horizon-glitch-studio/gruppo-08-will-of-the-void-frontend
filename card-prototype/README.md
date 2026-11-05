# Will of the Void – Card Prototypes

Anteprima delle carte in HTML e CSS vanilla (nessuna build). Questo file raccoglie le cose in sospeso, le decisioni prese e le idee per dopo.

## Stato attuale

- Carte con doppio strato `clip-path` (classe generica `.framed`): stesso risultato su Chrome e Safari (testato: desktop e iPhone). Non testato: Firefox, versioni vecchie dei browser.
- Richiede `clip-path: shape()`: Chrome 135, Safari 18.4, Firefox 148. Prima di quelle versioni il bordo non si vede, i pannelli mantengono la forma.
- La versione nativa (`corner-shape`, `border-shape`, `background-clip: border-area`) è commentata in fondo a `style.css`, da ripristinare quando sarà supportata ovunque.
- Icone: Phosphor Icons (MIT). Metti il testo della licenza in `assets/icons/LICENSE-phosphor.txt`.

## To do

1. Rarità a pallini (pieni/vuoti con `:nth-child` o `:nth-of-type`): decidere quanti livelli, e il colore del testo/pallini (bianco o accent).
2. Icone mancanti: energia (batteria con fulmine), shards (diamante sfaccettato), coppe, altre da un set esistente.

## Da decidere o approfondire

- **Testi lunghi nella descrizione:** `height: 150px` era provvisoria, passare a `min-height`. Opzioni: far crescere il box, troncare con `-webkit-line-clamp` (serve `display: -webkit-box`, `-webkit-box-orient: vertical` e `overflow: hidden`; la proprietà `line-clamp` standard non è ancora implementata da nessun browser), oppure troncare davanti e mostrare tutto sul retro della carta. I testi saranno validati lato server.
- **Testo più grande (impostazioni del browser):** la geometria è in px (badge 38px, notch 80px, padding), quindi non scala con il testo. Valutare `em`/`rem` per ciò che contiene testo.
- **Numeri di attacco e difesa:** sempre < 10 da design, quindi nessun problema di larghezza dei badge.
- **Layout della pagina:** la griglia attuale serve solo per i mockup. Servono media queries per il layout reale (sotto ~368px di viewport ora c'è overflow orizzontale: carta da 320px + 3rem di padding).
- **Variabili delle forme sul `:root`:** i valori sono risolti lì, quindi sovrascrivere `--cut` o `--border-width` su un singolo componente non aggiorna le forme. Documentare o ridefinire le forme nel componente.
- **Alone del nome e blur dei badge:** persi con il meccanismo attuale (il `filter: drop-shadow` rende il badge un "backdrop root"). Si recuperano con un wrapper in più, se serve.
- **Icone:** energia (fulmine in batteria) e tipo `electro` (fulmine) si somigliano; per ora contesti diversi (HUD contro carta).
- **Bassa priorità:** manca un `<h1>` nella pagina; `aria-label` dell'article duplica l'`<h2>`; Google Fonts da self-hostare; markup ripetuto (si risolve con React); font `Geist Pixel`: l'asse `ELSH` probabilmente non esiste (riga già commentata).

## Test da fare

- Firefox 148 o successivo, e versioni precedenti a Chrome 135, Safari 18.4, Firefox 148 (qui il bordo sparisce).
- Modalità ad alto contrasto (emulazione `forced-colors: active` nei DevTools, o Windows): gradienti e ombre vengono rimossi dal browser, quindi bordi e alone possono sparire; anche le icone fatte con `mask` possono sparire. Prevedere un fallback con bordo vero dentro `@media (forced-colors: active)`.
- Contrasto con arte molto chiara dietro ai pannelli (vedi sotto).
- Zoom 200%, testo del browser ingrandito, viewport 360px.
- Descrizioni e nomi lunghi.
- Prestazioni: Chrome DevTools → Performance con CPU 4× più lenta, scroll e hover, con 30–50 carte duplicate; Rendering → Paint flashing, FPS meter, Layer borders; Safari Web Inspector → Timelines. Se serve, in ordine: togliere il blur dal nome, limitare l'alone alle rare, animare solo `transform`/`opacity`, nelle liste lunghe rendere solo le carte visibili. Da verificare anche se ridurre `--panel-blur` (4px) cambia qualcosa.
- "Riduci trasparenza" attivo nel sistema operativo.

## Contrasti

Pannello `hsla(0, 0%, 10%, 0.75)` sopra l'arte. Caso peggiore (arte bianca): testo bianco ~7,7:1, icona del tipo in rosso `hsl(0 100% 60%)` ~2,1:1 (sotto il 3:1 richiesto per elementi non testuali). Con arte nera: icona ~5:1. Il testo è bianco, quindi il rischio è soprattutto sull'icona del tipo. Per misurare: DevTools → selezionare l'elemento → clic sul campione di colore → "Contrast ratio" (affidabile solo su sfondi pieni; sopra immagini o gradienti prendere il colore reale con il contagocce e controllarlo in un checker).

## Idee e impostazioni utente

- **Impostazione "disattiva trasparenza":** pannelli opachi e senza blur (accessibilità e prestazioni). Si appoggia a `--panel-bg` e `--panel-blur`.
- **Girare la carta (dettagli):** mostra tipo, testo completo, informazioni; vista full art senza descrizione (con `<img>`, per lazy loading e `alt`). Sostituisce il tooltip e risolve il touch.
- **Legenda dei tipi**, collegata alla carta girata.
- Tooltip: nessun tooltip custom; si usano `title` (solo per il mouse) e testo nascosto per gli screen reader.
- Valori vuoti o sconosciuti (`data-type`, `data-rarity`): validazione lato server; nel CSS il default è bianco, rarità standard.
