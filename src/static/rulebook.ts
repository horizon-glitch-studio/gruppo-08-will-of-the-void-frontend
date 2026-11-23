/**
 * Rulebook page. Without JavaScript the page shows everything: the contents open, every step of the example, the faction matrix.
 * With it, the contents close on small screens after a link is chosen, the example shows one step at a time, and two selects compare factions.
 */

import { showResult } from './versus'

const narrow = window.matchMedia('(max-width: 63.99rem)')

/** Contents: closed by default on small screens, closed again after jumping to a section. */
function setupContents() {
  const details = document.querySelector<HTMLDetailsElement>('.toc details')
  if (!details) return
  if (narrow.matches) details.open = false
  details.addEventListener('click', (event) => {
    if (narrow.matches && event.target instanceof HTMLAnchorElement) details.open = false
  })
}

/**
 * Match example: one step at a time inside its box, with previous and next arrows and the step count.
 * On the last step the next arrow gives way to Play now. The step count is announced when it changes.
 */
function setupExample() {
  const example = document.querySelector<HTMLElement>('[data-example]')
  const steps = example ? Array.from(example.querySelectorAll<HTMLElement>('.example-step')) : []
  const pager = example?.querySelector<HTMLElement>('.example-pager')
  if (!example || !pager || steps.length === 0) return
  const back = pager.querySelector<HTMLButtonElement>('[data-go="-1"]')!
  const next = pager.querySelector<HTMLButtonElement>('[data-go="1"]')!
  const count = pager.querySelector<HTMLElement>('.example-count')!
  const cta = pager.querySelector<HTMLElement>('[data-example-cta]')!

  let current = 0
  function show(index: number) {
    current = index
    const last = index === steps.length - 1
    steps.forEach((step, i) => (step.hidden = i !== index))
    count.textContent = `${index + 1}/${steps.length}`
    back.disabled = index === 0
    next.hidden = last
    cta.hidden = !last
  }
  pager.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-go]')
    if (!button || button.disabled) return
    show(current + Number(button.dataset.go))
  })
  example.dataset.enhanced = ''
  pager.hidden = false
  show(0)
}

/** Faction versus with two selects; the matching row, column and cell of the matrix light up. Without JavaScript only the matrix shows. */
function setupVersus() {
  const versus = document.querySelector<HTMLElement>('[data-versus-select]')
  const you = document.querySelector<HTMLSelectElement>('#versus-you')
  const opponent = document.querySelector<HTMLSelectElement>('#versus-opponent')
  const result = versus?.querySelector<HTMLElement>('.versus-result')
  const icons = document.querySelector<HTMLTemplateElement>('#faction-icons')
  const matrix = document.querySelector<HTMLTableElement>('.matrix')
  if (!versus || !you || !opponent || !result || !icons || !matrix) return
  const icon = (faction: string) => icons.content.querySelector(`[data-faction="${faction}"]`)?.innerHTML ?? ''
  const order = Array.from(you.options).map((option) => option.value)

  function update() {
    showResult(result!, you!.value, opponent!.value, icon)
    const row = order.indexOf(you!.value) + 1
    const column = order.indexOf(opponent!.value) + 1
    for (const cell of matrix!.querySelectorAll<HTMLElement>('[data-picked]')) delete cell.dataset.picked
    const rows = matrix!.rows
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].cells.length; c++) {
        if (r === row && c === column) rows[r].cells[c].dataset.picked = 'cell'
        else if (r === row || c === column) rows[r].cells[c].dataset.picked = 'line'
      }
    }
  }

  you.addEventListener('change', update)
  opponent.addEventListener('change', update)
  versus.hidden = false
  update()
}

setupContents()
setupExample()
setupVersus()
