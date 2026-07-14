/**
 * Redact an HTTP/Axios error into a secret-free form for logging and
 * propagation (IGDD-3108).
 *
 * An AxiosError carries the outgoing request `config` (and, for HTTP error
 * responses, `response.config` / `request`), which contains the Okta bearer
 * access token (`headers.Authorization`) and the mTLS client certificate,
 * private key, and passphrase (in `httpsAgent`). This helper keeps only the
 * non-secret diagnostic fields — `name`, `message`, `code`, HTTP `status`
 * (also exposed as `response.status` for downstream compatibility), and
 * `stack` — and drops everything capable of carrying a credential.
 *
 * Returns an `Error` instance so callers' existing `instanceof Error` handling
 * and `isServiceUnavailableError(...)` detection continue to work.
 */
export interface RedactedHttpError extends Error {
  code?: string
  status?: number
  response?: { status?: number }
}

export function redactHttpError(error: unknown): RedactedHttpError {
  if (!(error instanceof Error)) {
    return new Error(typeof error === 'string' ? error : 'Unknown error')
  }

  // ServiceUnavailableError (and anything already flagged) carries no request
  // config/credentials — pass it through so its class/marker survive for
  // isServiceUnavailableError() and downstream instanceof checks.
  if ((error as { isServiceUnavailable?: unknown }).isServiceUnavailable === true) {
    return error as RedactedHttpError
  }

  const source = error as Error & {
    code?: unknown
    status?: unknown
    response?: { status?: unknown }
  }

  const redacted: RedactedHttpError = new Error(error.message)
  redacted.name = error.name
  redacted.stack = error.stack

  if (typeof source.code === 'string') {
    redacted.code = source.code
  }

  const responseStatus =
    source.response && typeof source.response.status === 'number'
      ? source.response.status
      : typeof source.status === 'number'
        ? source.status
        : undefined

  if (typeof responseStatus === 'number') {
    redacted.status = responseStatus
    // Preserve the minimal shape downstream code reads (`error.response?.status`)
    // and that isServiceUnavailableError() uses for 502/503 detection.
    redacted.response = { status: responseStatus }
  }

  return redacted
}
