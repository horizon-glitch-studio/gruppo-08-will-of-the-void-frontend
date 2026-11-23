/**
 * "Who prevails over whom": two factions in, one result out. Shared by the home page (tiles) and the rulebook (selects).
 * The result shows two cards: the one that prevails is lifted with a glow, the other fades; even factions look the same.
 * Data from rules/factions.md: the twelve advantages and their reasons.
 */

const names: Record<string, string> = {
  lava: 'Lava',
  electro: 'Electro',
  radio: 'Radio',
  ice: 'Ice',
  metal: 'Metal',
  matte: 'Matte',
  gem: 'Gem',
  'noble-gas': 'Noble Gas',
}

const inert = new Set(['gem', 'noble-gas'])

/** Who prevails over whom, and why. */
const advantages: Record<string, Record<string, string>> = {
  lava: { metal: 'Lava melts metal.', matte: 'Lava melts the rock.' },
  electro: { lava: 'Lava conducts: the discharge runs through it.', ice: 'Ice conducts: the creature is struck by the discharge.' },
  radio: { lava: "Heat doesn't stop decay: radiation passes through lava.", matte: 'Radiation makes opaque matter decay from within.' },
  ice: { radio: 'Water is one of the best shields against radiation.', metal: 'Frost makes metal brittle and jams its gears.' },
  metal: { electro: 'Metal conducts the energy and discharges the excess.', radio: 'Metal armour shields radiation.' },
  matte: { electro: 'Rock insulates: the discharge finds no path and is lost.', ice: 'Dark surfaces absorb heat and melt ice.' },
}

export type Relation = 'prevails' | 'overpowered' | 'even' | 'same'

/** How your faction stands against the opponent. */
export function relation(you: string, opponent: string): Relation {
  if (you === opponent) return 'same'
  if (advantages[you]?.[opponent]) return 'prevails'
  if (advantages[opponent]?.[you]) return 'overpowered'
  return 'even'
}

/** Short labels for the opponent tiles, written next to the symbol so color is never the only cue. */
export const marks: Record<Relation, string> = { prevails: '▲ advantage', overpowered: '▼ disadvantage', even: '= even', same: '' }

/** Fills a .versus-result block. icon(faction) returns the SVG markup of the faction icon. */
export function showResult(result: HTMLElement, you: string, opponent: string, icon: (faction: string) => string) {
  const kind = relation(you, opponent)
  const [a, b] = [names[you], names[opponent]]
  const cards = result.querySelectorAll<HTMLElement>('.versus-card')
  const sides = [you, opponent]
  cards.forEach((card, i) => {
    card.dataset.faction = sides[i]
    card.dataset.result = kind === 'prevails' ? (i === 0 ? 'wins' : 'loses') : kind === 'overpowered' ? (i === 0 ? 'loses' : 'wins') : 'even'
    card.innerHTML = `${icon(sides[i])}<span>${names[sides[i]]}</span>`
  })

  const title = result.querySelector<HTMLElement>('.versus-title')!
  const note = result.querySelector<HTMLElement>('.versus-note')!
  if (kind === 'prevails') {
    title.textContent = `▲ ${a} prevails over ${b}`
    note.textContent = `${advantages[you][opponent]} ${a} creatures get +3 ATK in every clash against ${b}.`
  } else if (kind === 'overpowered') {
    title.textContent = `▼ ${b} prevails over ${a}`
    note.textContent = `${advantages[opponent][you]} ${b} creatures get +3 ATK in every clash against ${a}.`
  } else if (kind === 'same') {
    title.textContent = `= ${a} against ${a}`
    note.textContent = 'Same faction: no advantage.'
  } else {
    title.textContent = `= ${a} and ${b} are even`
    const inertOne = inert.has(you) ? a : inert.has(opponent) ? b : null
    note.textContent = inertOne ? `${inertOne} is inert: it never gives or receives an advantage.` : 'Neither gets an advantage.'
  }
  result.hidden = false
}
