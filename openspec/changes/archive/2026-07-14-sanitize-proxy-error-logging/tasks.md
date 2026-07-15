## 1. Redaction helper

- [x] 1.1 Add `src/utility/sanitizeHttpError.ts` exporting `redactHttpError(error): unknown` that returns a secret-free error: keep `name`, `message`, `code`, `status`, `stack`, and a minimal `response: { status }` when present; drop `config`, `request`, and `response.config`/`response.request` (where the `Authorization` header and `httpsAgent` cert/key/passphrase live). Non-axios errors pass through with only safe fields.
- [x] 1.2 Ensure the redacted error preserves `isServiceUnavailableError(...)` compatibility (retains `response.status` and axios `code`; `ServiceUnavailableError` passes through unchanged).

## 2. FetchDataFromEndpoint

- [x] 2.1 In `src/pages/api/serverside/FetchDataFromEndpoint.tsx` `fetchWithToken` catch, log `redactHttpError(error)` instead of the raw error.
- [x] 2.2 On the non-service-unavailable path, throw the redacted error instead of the raw AxiosError (keep throwing `ServiceUnavailableError` when `isServiceUnavailableError(error)`).

## 3. PushDataToEndpoint

- [x] 3.1 In `src/pages/api/serverside/PushDataToEndpoint.tsx` `pushWithToken` catch, log `redactHttpError(error)` instead of the raw error.
- [x] 3.2 Re-throw a redacted error (throw `ServiceUnavailableError` when `isServiceUnavailableError(error)`, else the redacted error) rather than the raw AxiosError.

## 4. Tests

- [x] 4.1 Unit-test `redactHttpError`: given a synthetic AxiosError with `config.headers.Authorization = 'Bearer eyJ…'` and an `httpsAgent` carrying cert/key/passphrase, the serialized result contains no `Bearer`, no `Authorization`, and none of the cert/key/passphrase, while `message`, `code`, and `response.status` are retained.
- [x] 4.2 Test `redactHttpError` preserves service-unavailable detection: `isServiceUnavailableError(redactHttpError(err503))` is true; a redacted 404 error still exposes `status: 404`.
- [x] 4.3 Test `FetchDataFromEndpoint`/`PushDataToEndpoint` failure paths: on a mocked axios rejection the logged value contains no bearer token, and the thrown error is redacted (no `config`) while `ServiceUnavailableError` is still thrown for 503/connection errors.

## 5. Verification

- [x] 5.1 Run `npm run code-quality-check` (lint + type-check) and `npm test`; fix any issues introduced by this change.
- [x] 5.2 Reproduce against a running instance: point `XFORM_SERVICE_ENDPOINT` at an unavailable service, load a page, and confirm `logs/log.json` failure entries contain no `Bearer`/`Authorization`/cert/key/passphrase while still showing message + status; confirm the page still renders its service-unavailable state.
