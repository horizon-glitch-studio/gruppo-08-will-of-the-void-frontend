type ApiErrorBody = {
  code?: unknown
  fieldErrors?: unknown
  details?: unknown
}

/** HTTP error returned by the backend. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined
  readonly fieldErrors: unknown
  readonly details: unknown

  constructor(status: number, body?: ApiErrorBody) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = typeof body?.code === 'string' ? body.code : undefined
    this.fieldErrors = body?.fieldErrors
    this.details = body?.details
  }
}

/** Reads the backend error fields when the response contains a JSON object. */
async function readErrorBody(response: Response): Promise<ApiErrorBody | undefined> {
  const text = await response.text()

  try {
    const body: unknown = JSON.parse(text)
    return body !== null && typeof body === 'object' && !Array.isArray(body) ? (body as ApiErrorBody) : undefined
  } catch {
    return undefined
  }
}

export interface Tokens {
  tokenType: string
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
}

type ApiPath = `/${string}`
type RequestOptions = RequestInit & { authenticated?: boolean; json?: unknown }

const storageKey = 'wotv.session'
const listeners = new Set<() => void>()

interface StoredSession {
  id: string
  tokens: Tokens
}

function readSession(): StoredSession | null | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    return typeof saved?.id === 'string' && typeof saved.tokens?.accessToken === 'string' && typeof saved.tokens.refreshToken === 'string' ? saved : null
  } catch {
    return undefined
  }
}

let session = readSession() ?? null
let sessionVersion = 0
let pendingRefresh: Promise<Tokens> | undefined
let storageAvailable = true

function updateSession(value: StoredSession | null) {
  const changed = session?.id !== value?.id
  session = value
  if (!changed) return

  sessionVersion++
  pendingRefresh = undefined
  for (const listener of listeners) listener()
}

function storeSession(value: StoredSession | null) {
  try {
    if (value) localStorage.setItem(storageKey, JSON.stringify(value))
    else localStorage.removeItem(storageKey)
    storageAvailable = true
  } catch {
    storageAvailable = false
  }
  updateSession(value)
}

function syncSession() {
  if (!storageAvailable) return
  const saved = readSession()
  if (saved !== undefined && (saved?.id !== session?.id || saved?.tokens.refreshToken !== session?.tokens.refreshToken)) updateSession(saved)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.storageArea === window.localStorage && (event.key === storageKey || event.key === null)) syncSession()
  })
}

/** Replaces or clears the current session and invalidates any previous refresh. */
export function setSession(value: Tokens | null) {
  storeSession(
    value && {
      id: crypto.getRandomValues(new Uint32Array(4)).join('-'),
      tokens: {
        tokenType: value.tokenType,
        accessToken: value.accessToken,
        accessTokenExpiresIn: value.accessTokenExpiresIn,
        refreshToken: value.refreshToken,
        refreshTokenExpiresIn: value.refreshTokenExpiresIn,
      },
    },
  )
}

/** Returns whether there is a session to validate with the API. */
export function getSessionVersion() {
  return session ? sessionVersion : null
}

/** Subscribes to sign-in and sign-out changes. */
export function subscribeToSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function invalidSession() {
  return new ApiError(401, { code: 'TOKEN_INVALID' })
}

function isInvalidToken(error: unknown) {
  return error instanceof ApiError && error.status === 401 && error.code === 'TOKEN_INVALID'
}

async function send<T>(path: ApiPath, options: RequestOptions, accessToken?: string): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
  if (!baseUrl) throw new Error('VITE_API_BASE_URL is missing')

  const { authenticated: _authenticated, json, ...init } = options
  const headers = new Headers(init.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
    init.body = JSON.stringify(json)
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  if (!response.ok) throw new ApiError(response.status, await readErrorBody(response))

  const body = await response.text()
  return body === '' ? (undefined as T) : JSON.parse(body)
}

async function rotateTokens(current: Tokens, version: number) {
  syncSession()
  const active = session
  if (!active || version !== sessionVersion) throw invalidSession()
  if (active.tokens.refreshToken !== current.refreshToken) return active.tokens

  try {
    const updated = await send<Tokens>('/auth/refresh', { method: 'POST', json: { refreshToken: current.refreshToken } })
    syncSession()
    if (version !== sessionVersion) throw invalidSession()
    storeSession({ id: active.id, tokens: updated })
    return updated
  } catch (error) {
    syncSession()
    if (!isInvalidToken(error) || version !== sessionVersion) throw error
    if (session && session.tokens.refreshToken !== current.refreshToken) return session.tokens
    setSession(null)
    throw error
  }
}

function withSessionLock<T>(action: () => Promise<T>) {
  const locks = globalThis.navigator?.locks
  return locks ? locks.request(storageKey, action) : action()
}

function refreshSession(current: Tokens, version: number) {
  if (pendingRefresh) return pendingRefresh

  // A refresh token can only be rotated once, including across tabs.
  const request = withSessionLock(() => rotateTokens(current, version)).finally(() => {
    if (pendingRefresh === request) pendingRefresh = undefined
  })
  pendingRefresh = request
  return request
}

async function sendAuthenticated<T>(path: ApiPath, makeOptions: (current: Tokens) => RequestOptions, refresh = refreshSession): Promise<T> {
  syncSession()
  const version = sessionVersion
  const current = refresh === refreshSession && pendingRefresh ? await pendingRefresh : session?.tokens
  if (!current || version !== sessionVersion) throw invalidSession()

  const sendWithSession = async (active: Tokens, options: RequestOptions) => {
    const response = await send<T>(path, options, active.accessToken)
    syncSession()
    if (version !== sessionVersion) throw invalidSession()
    return response
  }

  const options = makeOptions(current)
  try {
    return await sendWithSession(current, options)
  } catch (error) {
    if (!isInvalidToken(error) || version !== sessionVersion) throw error
  }

  options.signal?.throwIfAborted()
  const updated = await refresh(current, version)
  if (version !== sessionVersion) throw invalidSession()

  try {
    return await sendWithSession(updated, makeOptions(updated))
  } catch (error) {
    syncSession()
    if (version === sessionVersion && session?.tokens.refreshToken === updated.refreshToken && isInvalidToken(error)) setSession(null)
    throw error
  }
}

/** Sends a JSON API request. Protected requests retry once after a single shared token refresh. */
export function apiRequest<T>(path: ApiPath, options: RequestOptions = {}): Promise<T> {
  return options.authenticated ? sendAuthenticated<T>(path, () => options) : send<T>(path, options)
}

/** Revokes the active refresh token and clears the local session. */
export async function revokeSession() {
  syncSession()
  if (!session) return
  const version = sessionVersion

  await withSessionLock(async () => {
    syncSession()
    if (version !== sessionVersion) return

    try {
      // Holding the lock lets logout revoke the latest token and prevents a concurrent rotation.
      await sendAuthenticated<void>('/auth/logout', (current) => ({ method: 'POST', json: { refreshToken: current.refreshToken } }), rotateTokens)
    } finally {
      syncSession()
      if (version === sessionVersion) setSession(null)
    }
  })
}
