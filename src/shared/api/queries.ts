export interface PageQuery {
  page?: number
  size?: number
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}

export type ApiId = string | number

/** Serializes optional filters, preserving zero and false. */
export function queryString(filters: object) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  return params.size ? `?${params}` : ''
}
