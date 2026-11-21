import { Field } from '@/shared/components/Field'

interface DeckSelectProps {
  label: string
  decks: { id: number; name: string }[]
  value: number
  onChange: (deckId: number) => void
}

/** Select for the deck to play with, on the shared Field. */
export function DeckSelect({ label, decks, value, onChange }: DeckSelectProps) {
  return (
    <Field as="select" label={label} value={value} onChange={(event) => onChange(Number(event.target.value))}>
      {decks.map((deck) => (
        <option key={deck.id} value={deck.id}>
          {deck.name}
        </option>
      ))}
    </Field>
  )
}
