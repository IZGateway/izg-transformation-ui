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

  constructor(cause?: string) {
    super(
      cause
        ? `Transformation service is unavailable: ${cause}`
        : 'Transformation service is unavailable'
    )
    this.name = 'ServiceUnavailableError'
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
