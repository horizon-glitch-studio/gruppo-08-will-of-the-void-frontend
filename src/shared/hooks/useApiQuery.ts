import { useCallback, useEffect, useState } from 'react'
import { apiErrorMessage } from '@/shared/api/error-message'

type QueryState<T> =
  | { status: 'loading'; data: undefined; error: undefined; errorMessage: undefined }
  | { status: 'success'; data: T; error: undefined; errorMessage: undefined }
  | { status: 'error'; data: undefined; error: unknown; errorMessage: string }

/** Loads API data for a stable load function and cancels stale requests. */
export function useApiQuery<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ load: typeof load; attempt: number; state: QueryState<T> }>()
  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    const complete = (state: QueryState<T>) => {
      if (!controller.signal.aborted) setResult({ load, attempt, state })
    }

    async function query() {
      try {
        const data = await load(controller.signal)
        complete({ status: 'success', data, error: undefined, errorMessage: undefined })
      } catch (error) {
        complete({ status: 'error', data: undefined, error, errorMessage: apiErrorMessage(error) })
      }
    }

    void query()
    return () => controller.abort()
  }, [load, attempt])

  const state: QueryState<T> = result?.load === load && result.attempt === attempt ? result.state : { status: 'loading', data: undefined, error: undefined, errorMessage: undefined }

  return { ...state, reload }
}
