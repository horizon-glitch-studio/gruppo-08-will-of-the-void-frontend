/**
 * Home page. Without JavaScript the factions are a plain list and the card parts are a numbered legend.
 * With it, the factions become a versus picker and the legend highlights the matching part of the card.
 */

import './home.css'
import { marks, relation, showResult } from './versus'

/** Faction versus: your faction and an opponent, picked from two rows of tiles. Lava against Metal at first. */
function setupVersus() {
  const versus = document.querySelector<HTMLElement>('[data-versus]')
  const picker = versus?.querySelector<HTMLElement>('.versus-picker')
  const result = versus?.querySelector<HTMLElement>('.versus-result')
  const fallback = versus?.querySelector<HTMLElement>('.faction-fallback')
  if (!versus || !picker || !result || !fallback) return
  const rows = { you: picker.querySelector<HTMLElement>('[data-pick="you"]')!, opponent: picker.querySelector<HTMLElement>('[data-pick="opponent"]')! }
  const picked = { you: 'lava', opponent: 'metal' }
  const icon = (faction: string) => rows.you.querySelector(`[data-faction="${faction}"] svg`)?.outerHTML ?? ''

  function update() {
    for (const [side, row] of Object.entries(rows)) {
      for (const tile of row.querySelectorAll<HTMLButtonElement>('.versus-tile')) {
        const faction = tile.dataset.faction ?? ''
        tile.setAttribute('aria-pressed', String(faction === picked[side as keyof typeof picked]))
        // Opponent tiles say how each faction stands against yours
        if (side === 'opponent') tile.querySelector<HTMLElement>('.versus-mark')!.textContent = marks[relation(picked.you, faction)]
      }
    }
    showResult(result!, picked.you, picked.opponent, icon)
  }

  picker.addEventListener('click', (event) => {
    const tile = (event.target as Element).closest<HTMLButtonElement>('.versus-tile')
    const row = tile?.closest<HTMLElement>('[data-pick]')
    if (!tile || !row) return
    picked[row.dataset.pick as keyof typeof picked] = tile.dataset.faction ?? ''
    update()
  })
  picker.hidden = false
  fallback.hidden = true
  update()
}

/** Card anatomy: pressing a legend item highlights its part of the card. Pressing it again clears it. */
function setupAnatomy() {
  const items = Array.from(document.querySelectorAll<HTMLButtonElement>('.anatomy-item'))
  const parts = Array.from(document.querySelectorAll<HTMLElement>('.anatomy-card [data-part]'))
  function highlight(part: string | null) {
    for (const item of items) item.setAttribute('aria-pressed', String(item.dataset.part === part))
    for (const element of parts) element.toggleAttribute('data-active', element.dataset.part === part)
  }
  for (const item of items) {
    item.addEventListener('click', () => highlight(item.getAttribute('aria-pressed') === 'true' ? null : (item.dataset.part ?? null)))
  }
}

/**
 * Ring of cards: the arrows turn it by one card, dragging turns it freely and snaps to the nearest card on release.
 * The scroll turns it too (home.css); this only adds an offset on top.
 */
function setupRing() {
  const stage = document.querySelector<HTMLElement>('[data-ring]')
  const ring = stage?.querySelector<HTMLElement>('.ring')
  const controls = stage?.querySelector<HTMLElement>('.ring-controls')
  if (!stage || !ring || !controls) return
  const step = 360 / ring.children.length
  let offset = 0
  const set = () => ring.style.setProperty('--_ring-offset', `${offset}deg`)

  controls.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-turn]')
    if (!button) return
    offset -= Number(button.dataset.turn) * step
    set()
  })

  let startX = 0
  let startOffset = 0
  stage.addEventListener('pointerdown', (event) => {
    if ((event.target as Element).closest('button') || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    startX = event.clientX
    startOffset = offset
    ring.dataset.dragging = ''
    stage.setPointerCapture(event.pointerId)
  })
  stage.addEventListener('pointermove', (event) => {
    if (!('dragging' in ring.dataset)) return
    offset = startOffset + (event.clientX - startX) * 0.3
    set()
  })
  const end = () => {
    if (!('dragging' in ring.dataset)) return
    delete ring.dataset.dragging
    offset = Math.round(offset / step) * step
    set()
  }
  stage.addEventListener('pointerup', end)
  stage.addEventListener('pointercancel', end)
  controls.hidden = false
}

/**
 * Logo flight: measures how far the hero logo must travel and shrink to land on the bar logo, for home.css.
 * The flight lasts as much scroll as the logo height. Measured again when the page has loaded and when the window changes size.
 */
function setupLogoFlight() {
  const hero = document.querySelector<HTMLElement>('.hero-title')
  const target = document.querySelector<HTMLElement>('.site-logo .logo')
  if (!hero || !target) return
  const root = document.documentElement

  function measure() {
    root.classList.remove('logo-fly')
    const from = hero!.getBoundingClientRect()
    // The flight lasts as many pixels of scroll as the logo is tall, so it lands before the text under it reaches the bar
    const end = from.height
    const to = target!.getBoundingClientRect()
    const fromTop = from.top + window.scrollY
    root.style.setProperty('--_fly-end', `${end}px`)
    root.style.setProperty('--_fly-x', `${to.left + to.width / 2 - (from.left + from.width / 2)}px`)
    root.style.setProperty('--_fly-y', `${to.top + to.height / 2 + end - (fromTop + from.height / 2)}px`)
    root.style.setProperty('--_fly-scale', String(to.height / from.height))
    root.classList.add('logo-fly')
  }
  measure()
  // Safari can lay the page out again after the first run (fonts, images): measure again once everything is loaded
  window.addEventListener('load', measure)
  void document.fonts.ready.then(measure)
  window.addEventListener('resize', measure)
}

setupVersus()
setupAnatomy()
setupRing()
setupLogoFlight()
