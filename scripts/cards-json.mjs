/**
 * Builds the mock card catalog from the card CSV (Drive: wotv-cards-slot-1.csv), in the shape of GET /api/v1/cards.
 *
 * Usage: npm run cards-json -- <path to the CSV>
 * Output: src/shared/api/mock/cards.json, read only when VITE_MOCK_CARDS=true.
 * Columns used: name, faction, rarity, atk, def, description, alt, image. The other columns are working notes.
 * Ids follow the CSV order. Faction and rarity ids follow the insert order of the backend migration V2__reference_data.sql.
 * Run it again when the CSV changes; delete the mock once the backend serves the cards.
 */
import { readFile, writeFile } from 'node:fs/promises'

const OUTPUT = 'src/shared/api/mock/cards.json'

/** V2__reference_data.sql: name, inert. */
const FACTIONS = [
  ['Lava', false],
  ['Electro', false],
  ['Radio', false],
  ['Ice', false],
  ['Metal', false],
  ['Matte', false],
  ['Gem', true],
  ['Noble Gas', true],
].map(([name, inert], index) => ({ id: index + 1, name, inert }))

/** V2__reference_data.sql: name, max copies per deck, max per deck, days on board, tradeable, ATK + DEF. */
const RARITIES = [
  ['Captive', 3, null, null, true, 12],
  ['Conscript', 3, null, null, true, 16],
  ['Soldier', 2, 8, null, true, 20],
  ['Champion', 1, 3, null, true, 24],
  ['Elect', 1, 2, null, true, 28],
  ['Wanderer', 1, 1, 7, false, 32],
].map(([name, maxCopiesPerDeck, maxPerDeck, durationDays, tradeable, points], index) => ({
  rarity: { id: index + 1, name, sortOrder: index + 1, maxCopiesPerDeck, maxPerDeck, durationDays, tradeable },
  points,
}))

/**
 * Splits CSV text into rows of fields (RFC 4180: quoted fields may hold commas, line breaks and doubled quotes).
 * @param {string} text
 */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  if (field || row.length) rows.push([...row, field])
  return rows.filter((r) => r.some((value) => value.trim()))
}

const input = process.argv[2]
if (!input) throw new Error('Usage: npm run cards-json -- <path to the CSV>')

const [header, ...rows] = parseCsv(await readFile(input, 'utf8'))
const column = Object.fromEntries(header.map((name, index) => [name.trim(), index]))
const problems = []

const cards = rows.map((row, index) => {
  const value = (/** @type {string} */ name) => row[column[name]]?.trim() ?? ''
  const name = value('name')
  const faction = FACTIONS.find((item) => item.name === value('faction'))
  const rarity = RARITIES.find((item) => item.rarity.name === value('rarity'))
  const attack = Number(value('atk'))
  const defense = Number(value('def'))
  if (!faction) problems.push(`${name}: unknown faction "${value('faction')}"`)
  if (!rarity) problems.push(`${name}: unknown rarity "${value('rarity')}"`)
  else if (attack + defense !== rarity.points) problems.push(`${name}: ATK + DEF is ${attack + defense}, ${rarity.rarity.name} has ${rarity.points}`)
  const folder = (faction?.name ?? '').toLowerCase().replaceAll(' ', '-')
  return {
    id: index + 1,
    name,
    description: value('description') || null,
    imageUrl: value('image') ? `/cards/${folder}/${value('image').replace(/\.\w+$/, '')}` : null,
    imageAlt: value('alt') || null,
    faction,
    rarity: rarity?.rarity,
    attack,
    defense,
  }
})

if (problems.length) throw new Error(`The CSV has problems:\n${problems.join('\n')}`)

await writeFile(OUTPUT, `${JSON.stringify(cards, null, 2)}\n`)
process.stdout.write(`${OUTPUT}: ${cards.length} cards\n`)
