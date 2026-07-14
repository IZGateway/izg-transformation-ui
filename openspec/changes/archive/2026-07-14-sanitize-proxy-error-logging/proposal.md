## Why

When a server-side call to the Transformation Service fails, the Transformation Console writes the raw AxiosError to the logs — and that error object carries the outgoing request `config`, which contains the logged-in user's Okta **access token** (`headers.Authorization: Bearer …`) as well as the **mTLS client certificate, private key, and passphrase** (in `httpsAgent`). These land in `logs/log.json` and are shipped to Elasticsearch, where anyone with log/Kibana access could read (and replay) them. This is a security and audit defect (IGDD-3108) and contradicts the "no secret material in logs" requirement. It fires on **any** backend failure (503, connection refused, timeout, 4xx/5xx) and is not gated by any debug flag.

## What Changes

- Add a small shared helper that **redacts** an HTTP/Axios error into a safe form for logging and propagation — preserving useful diagnostics (`name`, `message`, `code`, HTTP `status`, `response.status`, `stack`) while removing everything that can carry a secret (`config`, `request`, `response.config`, and any headers/agent within them).
- **`FetchDataFromEndpoint.tsx`**: in the `fetchWithToken` catch, log the **redacted** error instead of the raw AxiosError, and ensure the error it re-throws is redacted so downstream catches cannot re-leak it.
- **`PushDataToEndpoint.tsx`**: same treatment for the `pushWithToken` catch (which today logs the raw error and re-throws it unmodified).
- **Behavior preserved:** `ServiceUnavailableError` is still thrown for 502/503/connection failures, `isServiceUnavailableError(...)` still detects unavailability, and downstream `error.response?.status` / status-based messaging still works — the redacted error keeps those safe fields.
- **Not changed:** `deephealthcheck` (uses mTLS only, attaches no token, and does not log the raw error), the `logRequest` debug path (separately gated), and the ~15 downstream `console.error('…', error)` call sites — sanitizing at the source (the two token-bearing helpers) protects them all without touching each one.

## Capabilities

### New Capabilities
- `sanitize-proxy-error-logging`: Server-side Transformation Service proxy helpers (`FetchDataFromEndpoint`, `PushDataToEndpoint`) must never emit credential material — the Okta bearer access token or the mTLS certificate/key/passphrase — when a backend request fails, whether the failure is logged locally or the error propagates to a downstream logger. Covers what is stripped, what safe diagnostics are retained, and preservation of existing service-unavailable handling.

### Modified Capabilities
<!-- None. No existing capability's requirements change. -->

## Impact

- **Code:**
  - New `src/utility/sanitizeHttpError.ts` (or similar) — a `redactHttpError(error)` helper returning a secret-free error/object that retains `name`, `message`, `code`, `status`, `response.status`, and `stack`.
  - `src/pages/api/serverside/FetchDataFromEndpoint.tsx` — redact before `console.error` and before re-throw.
  - `src/pages/api/serverside/PushDataToEndpoint.tsx` — redact before `console.error` and before re-throw.
- **Security:** Removes an unconditional leak of a valid Okta access token and the mTLS private key/passphrase from application logs and Elasticsearch. No change to authentication, request behavior, or what is sent to the backend — only to what is logged/propagated on failure.
- **Backward compatibility:** Behavior-preserving. Existing error handling (`ServiceUnavailableError`, `isServiceUnavailableError`, downstream `serviceUnavailable` props and status-based messages) continues to work; only the secret-bearing fields are removed from logged/propagated errors.
- **Observability:** Failure log entries keep their message, HTTP status, and error code, so diagnosability is retained; they no longer contain `Authorization`, bearer tokens, certificates, keys, or passphrases.
- **Scope:** Transformation Console only; fixes IGDD-3108 (discovered during IGDD-2223).
