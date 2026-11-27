import { useEffect, useSyncExternalStore } from 'react'

/*
 * Title of the current page, when it comes from the data and not from the route meta: the name of a card, a deck,
 * another Summoner. PageHeader shows it in place of the meta title (heading and browser tab); the back link stays.
 * One page at a time, so one value for the whole platform.
 */
let current: string | undefined
const listeners = new Set<() => void>()

function setTitle(title: string | undefined) {
  if (title === current) return
  current = title
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Gives the page a title from its data: `usePageTitle(data?.card.name)`.
 * While it is undefined (loading, error) the header keeps the title of the route meta ("Card").
 * Leaving the page brings the meta title back.
 */
export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    setTitle(title)
    return () => setTitle(undefined)
  }, [title])
}

/** The title set by the page with usePageTitle, if any. For PageHeader. */
export function usePageTitleOverride() {
  return useSyncExternalStore(subscribe, () => current)
}
