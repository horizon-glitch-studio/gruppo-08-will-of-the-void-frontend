import { useEffect, useRef } from 'react'

interface FormFeedback {
  pending: boolean
  errorMessage?: string
  fieldErrors: Record<string, string>
}

/** Focuses the first invalid control, or the submit button when an error has no field. */
export function useFormErrorFocus({ pending, errorMessage, fieldErrors }: FormFeedback) {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const form = formRef.current
    if (!form || pending || (!errorMessage && Object.keys(fieldErrors).length === 0)) return

    const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')
    const target = firstInvalid ?? form.querySelector<HTMLButtonElement>('button[type="submit"]:not(:disabled)')
    target?.focus()
  }, [pending, errorMessage, fieldErrors])

  return formRef
}
