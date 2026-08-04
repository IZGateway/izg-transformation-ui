const serviceUnavailableMarkers = [
  'fetch failed',
  'econnrefused',
  'enotfound',
  'econnreset',
  'network error',
]

const includesServiceUnavailableMarker = (value: unknown) => {
  if (typeof value !== 'string') return false

  const normalizedValue = value.toLowerCase()
  return serviceUnavailableMarkers.some((marker) =>
    normalizedValue.includes(marker)
  )
}

const getResponseStatus = (err: unknown) => {
  if (
    typeof err !== 'object' ||
    err === null ||
    !('response' in err) ||
    typeof err.response !== 'object' ||
    err.response === null ||
    !('status' in err.response)
  ) {
    return undefined
  }

  return typeof err.response.status === 'number'
    ? err.response.status
    : undefined
}

const getErrorCause = (err: Error) => {
  if (!('cause' in err) || typeof err.cause !== 'object' || err.cause === null) {
    return undefined
  }

  return err.cause as { code?: string; message?: string }
}

export class ServiceUnavailableError extends Error {
  readonly isServiceUnavailable = true
  readonly status?: number
  readonly response?: { status: number }

  constructor(cause?: string, status?: number) {
    super(
      cause
        ? `Transformation service is unavailable: ${cause}`
        : 'Transformation service is unavailable'
    )
    this.name = 'ServiceUnavailableError'
    // Carry the upstream HTTP status (when known) so API routes that read
    // error.response.status still propagate a 502/503 to the client instead of
    // defaulting to 500. Status is a number — no credential material.
    if (typeof status === 'number') {
      this.status = status
      this.response = { status }
    }
  }
}

export function isServiceUnavailableError(
  err: unknown
): err is ServiceUnavailableError {
  if (err instanceof ServiceUnavailableError) return true

  const status = getResponseStatus(err)
  if (status === 502 || status === 503) return true

  if (typeof err === 'string') {
    return includesServiceUnavailableMarker(err)
  }

  if (err instanceof TypeError) {
    const cause = getErrorCause(err)
    return (
      includesServiceUnavailableMarker(err.message) ||
      includesServiceUnavailableMarker(cause?.code) ||
      includesServiceUnavailableMarker(cause?.message)
    )
  }

  if (err instanceof Error) {
    const cause = getErrorCause(err)
    return (
      includesServiceUnavailableMarker(err.message) ||
      includesServiceUnavailableMarker(cause?.code) ||
      includesServiceUnavailableMarker(cause?.message)
    )
  }

  return false
}
