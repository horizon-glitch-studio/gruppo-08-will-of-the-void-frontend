interface ErrorBoxProps {
  /** Text for the user, from apiErrorMessage. */
  message: string
  /** Shows a "Try again" button when given. */
  onRetry?: () => void
}

/** Error message of a request, with an optional retry button. */
export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return (
    <div>
      <p role="alert">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
