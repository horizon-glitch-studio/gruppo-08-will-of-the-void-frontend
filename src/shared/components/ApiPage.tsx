import { useEffect, useState, type ReactNode } from 'react'
import { apiErrorMessage } from '@/shared/api/error-message'

interface ApiPageProps<T> {
  title: string
  load: (signal: AbortSignal) => Promise<T>
  children: (data: T) => ReactNode
}

/** Renders the loading, error and content states of a service-backed page. */
export function ApiPage<T>({ title, load, children }: ApiPageProps<T>) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<({ data: T } | { error: unknown }) & { load: typeof load; attempt: number }>()
  const reload = () => setAttempt((value) => value + 1)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, attempt, data })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ load, attempt, error })
      },
    )
    return () => controller.abort()
  }, [load, attempt])

  const current = result?.load === load && result.attempt === attempt ? result : undefined

  return (
    <section>
      <title>{`${title} – Will of the Void`}</title>
      <h1>{title}</h1>
      {!current ? (
        <output>Loading…</output>
      ) : 'error' in current ? (
        <>
          <p role="alert">{apiErrorMessage(current.error)}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </>
      ) : (
        children(current.data)
      )}
    </section>
  )
}
