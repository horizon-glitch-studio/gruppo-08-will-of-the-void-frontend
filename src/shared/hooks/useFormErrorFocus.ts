import { useCallback, useEffect, useRef } from 'react'

interface FormFeedback {
  pending: boolean
  focusFeedback?: boolean
  errorMessage?: string
  fieldErrors: Record<string, string>
}

/** Restores focus to form feedback, the first invalid control, or the submit button. */
export function useFormErrorFocus({ pending, errorMessage, fieldErrors, focusFeedback }: FormFeedback) {
  const formRef = useRef<HTMLFormElement>(null)
  const feedback = useRef<HTMLElement>(null)
  const feedbackRef = useCallback((element: HTMLElement | null) => {
    feedback.current = element
  }, [])

  useEffect(() => {
    if (pending) return
    if (focusFeedback) {
      feedback.current?.focus()
      return
    }

    const form = formRef.current
    if (!form || (!errorMessage && Object.keys(fieldErrors).length === 0)) return

    const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')
    const target = firstInvalid ?? form.querySelector<HTMLButtonElement>('button[type="submit"]:not(:disabled)')
    target?.focus()
  }, [pending, errorMessage, fieldErrors, focusFeedback])

  return { formRef, feedbackRef }
}
