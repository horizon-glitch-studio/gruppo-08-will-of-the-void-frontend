import { useMatches, useParams } from 'react-router'
import type { PageMeta } from '../routes/meta'

function isPageMeta(handle: unknown): handle is PageMeta {
  return typeof handle === 'object' && handle !== null && 'title' in handle
}

/** Meta of the current screen (deepest route with a handle) and where its "back" link goes. */
export function usePageMeta() {
  const matches = useMatches()
  const params = useParams()
  const meta = matches.map((match) => match.handle).findLast(isPageMeta)
  const parent = meta?.parent
  const back = parent?.path ? { to: typeof parent.path === 'function' ? parent.path(params) : parent.path, label: parent.title } : undefined

  return { meta, back }
}
