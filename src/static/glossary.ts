/**
 * Glossary page: filters the terms while typing. Without JavaScript the search field stays hidden and every term is shown.
 */

const search = document.querySelector<HTMLElement>('.glossary-search')
const input = document.querySelector<HTMLInputElement>('#glossary-search')
const empty = document.querySelector<HTMLElement>('.glossary-empty')
const groups = Array.from(document.querySelectorAll<HTMLElement>('.glossary-group'))

if (search && input && empty) {
  search.hidden = false
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase()
    let found = 0
    for (const group of groups) {
      let inGroup = 0
      for (const term of group.querySelectorAll<HTMLElement>('.term')) {
        const match = !query || (term.textContent ?? '').toLowerCase().includes(query)
        term.hidden = !match
        if (match) inGroup++
      }
      group.hidden = inGroup === 0
      found += inGroup
    }
    empty.hidden = found > 0
  })
}
