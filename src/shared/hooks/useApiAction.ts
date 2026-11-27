import { useRef, useState } from 'react'
import { ApiError } from '@/shared/api/client'
import { apiErrorMessage, apiFieldMessages } from '@/shared/api/error-message'

interface ActionState {
  pending: boolean
  errorCode?: string
  errorMessage?: string
  fieldErrors: Record<string, string>
  success: boolean
}

/** Runs an API mutation with feedback and prevents overlapping submissions. */
export function useApiAction<Args extends unknown[]>(action: (...args: Args) => Promise<unknown>) {
  const running = useRef(false)
  const [state, setState] = useState<ActionState>({ pending: false, fieldErrors: {}, success: false })

  async function run(...args: Args) {
    if (running.current) return

    running.current = true
    setState({ pending: true, fieldErrors: {}, success: false })
    try {
      await action(...args)
      setState({ pending: false, fieldErrors: {}, success: true })
    } catch (error) {
      setState({
        pending: false,
        errorCode: error instanceof ApiError ? error.code : undefined,
        errorMessage: apiErrorMessage(error),
        fieldErrors: apiFieldMessages(error),
        success: false,
      })
    } finally {
      running.current = false
    }
  }

  return { run, ...state }
}
