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
import { ServiceUnavailableError } from './serviceUnavailable'

export interface RedactedHttpError extends Error {
  code?: string
  status?: number
  // `data` is the backend's response body (not credential material, which lives
  // in config/request); downstream API routes surface it as the user-facing
  // error message, so it is retained.
  response?: { status?: number; data?: unknown }
}

export function redactHttpError(error: unknown): RedactedHttpError {
  if (!(error instanceof Error)) {
    // Surface a useful message for non-Error throws (matches the helpers' prior
    // `String(error)` behavior). Safe from leaks: a thrown plain object
    // stringifies to "[object Object]", and real Axios errors are Error
    // instances handled below.
    const message =
      typeof error === 'string'
        ? error
        : error == null
          ? 'Unknown error'
          : String(error)
    return new Error(message)
  }

  // ServiceUnavailableError carries no request config/credentials — pass it
  // through so its class/marker survive for isServiceUnavailableError() and
  // downstream instanceof checks. Restricted to the known-safe class (not a
  // permissive `isServiceUnavailable` marker check) so nothing carrying a
  // config/request can slip past redaction.
  if (error instanceof ServiceUnavailableError) {
    return error as RedactedHttpError
  }

  const source = error as Error & {
    code?: unknown
    status?: unknown
    response?: { status?: unknown; data?: unknown }
  }

  const redacted: RedactedHttpError = new Error(error.message)
  redacted.name = error.name
  redacted.stack = error.stack

  if (typeof source.code === 'string') {
    redacted.code = source.code
  }

  const response =
    source.response && typeof source.response === 'object'
      ? source.response
      : undefined

  const responseStatus =
    response && typeof response.status === 'number'
      ? response.status
      : typeof source.status === 'number'
        ? source.status
        : undefined

  // Rebuild `response` with only the safe fields downstream needs — the HTTP
  // status (also used by isServiceUnavailableError for 502/503) and the backend
  // response body (`data`). Deliberately omit `config`/`request`/`headers`,
  // which is where the bearer token and mTLS key material live.
  if (responseStatus !== undefined || (response && 'data' in response)) {
    redacted.response = {}
    if (responseStatus !== undefined) {
      redacted.response.status = responseStatus
    }
    if (response && 'data' in response) {
      redacted.response.data = response.data
    }
  }

  if (responseStatus !== undefined) {
    redacted.status = responseStatus
  }

  return redacted
}
