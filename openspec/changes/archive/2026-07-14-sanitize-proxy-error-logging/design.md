## Context

`FetchDataFromEndpoint.tsx` and `PushDataToEndpoint.tsx` are the two server-side helpers that proxy to the Transformation Service over mTLS + a Bearer JWT. Each builds an axios request whose `config` includes:
- `headers.Authorization = "Bearer <okta_access_token>"` (when `XFORM_SERVICE_ENDPOINT_USE_JWT !== 'false'`), and
- `httpsAgent` built from the client certificate, private key, and passphrase (when `USE_CERT !== 'false'`).

On failure both do `console.error('Error …:', error)` with the **raw AxiosError**. AxiosErrors attach the full request `config` (and, for HTTP error responses, `response.config` / `request`), so the access token *and* the mTLS key material are serialized by the Winston/ECS logger into `logs/log.json` and shipped to Elasticsearch. `console.error` is monkey-patched to `logger.error`, which is emitted at the default `info` level — so the leak is unconditional on any backend failure (IGDD-3108).

Additionally:
- `FetchDataFromEndpoint` re-throws `ServiceUnavailableError` for service-unavailable cases but re-throws the **original** AxiosError otherwise; `PushDataToEndpoint` re-throws the original AxiosError for everything. So the secret can leak a second time at any downstream `console.error('…', error)` (page `getServerSideProps`, `/api/*` handlers, client-side component actions).
- Downstream service-unavailable detection uses `isServiceUnavailableError(err)` (`src/utility/serviceUnavailable.ts`), which checks `err.response.status === 502/503`, `err instanceof ServiceUnavailableError`, or network markers in `err.message`/`err.cause`. Some downstream code also reads `err.response?.status` for status-based messaging.
- `deephealthcheck` uses axios with mTLS **only** (no `Authorization` header) and does not log the raw error, so it is out of scope.

## Goals / Non-Goals

**Goals:**
- Ensure the two proxy helpers never log or propagate credential material (bearer token, cert, key, passphrase) on failure.
- Keep failures diagnosable (retain name/message/code/HTTP status).
- Preserve existing behavior: `ServiceUnavailableError`, `isServiceUnavailableError`, downstream `serviceUnavailable` props, and status-based messaging.

**Non-Goals:**
- Changing the ~15 downstream `console.error('…', error)` call sites individually (sanitizing at the source protects them all).
- Changing request behavior or what is sent to the backend.
- Touching the debug-gated `logRequest` req/res dump (separate concern) or `deephealthcheck`.
- Removing `console.error` usage / the logger monkey-patch.

## Decisions

### D1 — Redact in place, preserving safe fields (chosen)

Add `src/utility/sanitizeHttpError.ts` exporting `redactHttpError(error): unknown`. It returns a secret-free representation that **keeps** `name`, `message`, `code`, `status`, `response.status`, and `stack`, and **drops** `config`, `request`, and `response.config`/`response.request` (which is where the `Authorization` header and the `httpsAgent` cert/key/passphrase live).

Implementation shape: for an axios-style error, build a lightweight object/error carrying only the safe fields (including a minimal `response: { status }` when an HTTP response was present) plus `isServiceUnavailable`/marker-relevant fields so `isServiceUnavailableError` keeps working. Non-axios `Error`s pass through with only `name`/`message`/`code`/`stack`. Never deep-copy `config`/`httpsAgent`.

- **Why preserve `response.status`:** downstream `isServiceUnavailableError` and status-based messages read `err.response?.status`; keeping just the numeric status retains that behavior without secrets.
- **Alternative rejected — strip only `headers.Authorization`:** leaves the mTLS key/passphrase (in `httpsAgent`) and other header material; brittle. Dropping the whole `config`/`request` is safer and simpler.
- **Alternative rejected — reconstruct a bare `new Error(message)`:** loses `code`/`status`, breaking downstream detection/messaging and the existing tests.

### D2 — Apply at both log and re-throw points

In each helper's `catch`:
1. Log `redactHttpError(error)` instead of the raw `error`.
2. Preserve the service-unavailable mapping: if `isServiceUnavailableError(error)` → throw `ServiceUnavailableError(...)` (as `FetchDataFromEndpoint` already does); otherwise throw the **redacted** error (not the raw AxiosError).

This makes `PushDataToEndpoint` consistent with `FetchDataFromEndpoint` (it currently re-throws raw for everything) and guarantees no downstream logger can re-leak the token. `ServiceUnavailableError` already carries no secrets.

### D3 — Keep detection intact

`isServiceUnavailableError` is evaluated on the **original** error inside the helper (before redaction) to decide whether to throw `ServiceUnavailableError`. For the non-unavailable path, the redacted error retains `response.status` and the axios `code`, so any downstream re-check still resolves the same way. `ServiceUnavailableError` continues to satisfy `isServiceUnavailableError` via its `isServiceUnavailable` marker.

## Risks / Trade-offs

- **Over-stripping breaks downstream status logic** → Mitigation: retain `response.status` + `code`; cover with a test asserting `isServiceUnavailableError(redacted)` for 503 and that a 404 redacted error still exposes `status`.
- **Missing a secret-bearing field** → Mitigation: drop entire `config`/`request`/`response.config` rather than allowlisting individual headers; add a test asserting the serialized redacted error contains no `Bearer`, no `Authorization`, and none of the cert/key/passphrase env values.
- **A downstream site logs something *other* than the propagated error** → Out of scope here; the two helpers are the only place the token/cert enter an error object. Sanitizing at the source is the correct choke point.
- **Behavioral change in `PushDataToEndpoint` re-throw** (raw → redacted/ServiceUnavailableError) → Verify existing Push-path tests and the pages/components that consume it still behave (status/message retained).

## Migration Plan

Additive/behavior-preserving; no data migration. Takes effect on next deploy. **Rollback:** revert the change — helpers return to logging/propagating the raw error (reintroducing the leak).

## Open Questions

- None blocking. Follow-up (optional): a defensive redaction step in the logger format itself (belt-and-suspenders) is possible but not needed once the source is sanitized.
