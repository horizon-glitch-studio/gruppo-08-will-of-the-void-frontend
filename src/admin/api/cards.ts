const cards = [{ id: 1, name: 'Example card' }]

/** Catalog preview until the backend exposes the backoffice card routes. */
export const adminCardsService = {
  list: () => Promise.resolve(cards),
}
