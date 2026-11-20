import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { apiErrorMessage, apiFieldMessages } from '@/shared/api/error-message'

interface ApiFormProps {
  children?: ReactNode
  label: string
  submit: (data: FormData) => Promise<unknown>
  success?: string
}

/** Handles submission, feedback and duplicate clicks for API-backed forms. */
export function ApiForm({ children, label, submit, success }: ApiFormProps) {
  const busy = useRef(false)
  const [state, setState] = useState<{ pending: boolean; message?: string; error?: string; fields?: string[] }>({ pending: false })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    const data = new FormData(event.currentTarget)
    busy.current = true
    setState({ pending: true })
    try {
      await submit(data)
      setState({ pending: false, message: success })
    } catch (error) {
      setState({ pending: false, error: apiErrorMessage(error), fields: Object.values(apiFieldMessages(error)) })
    } finally {
      busy.current = false
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {children}
      <button type="submit" disabled={state.pending}>
        {state.pending ? 'Please wait…' : label}
      </button>
      {state.error && (
        <div role="alert">
          <p>{state.error}</p>
          {!!state.fields?.length && (
            <ul>
              {state.fields.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {state.message && <output>{state.message}</output>}
    </form>
  )
}
