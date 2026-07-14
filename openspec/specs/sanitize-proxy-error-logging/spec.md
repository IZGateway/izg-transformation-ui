# Spec: Sanitize Proxy Error Logging

## Purpose

Ensures that when server-side calls to the Transformation Service made through the
`FetchDataFromEndpoint` / `PushDataToEndpoint` proxy helpers fail, neither the
emitted log events nor the re-thrown error objects leak credential material
(the `Authorization` header, the bearer access token, or the mTLS client
certificate, private key, or passphrase). Redaction retains non-secret
diagnostics for troubleshooting and preserves the console's existing
service-unavailable handling.

## Requirements

### Requirement: Proxy-helper failure logs contain no credentials

When a server-side call to the Transformation Service made through `FetchDataFromEndpoint` or `PushDataToEndpoint` fails, the resulting log event SHALL NOT contain any credential material — specifically no `Authorization` header, no bearer access token, and no mTLS client certificate, private key, or passphrase. This SHALL hold at every log level (it is not conditional on a debug flag).

#### Scenario: Fetch failure logs a redacted error

- **WHEN** an `axios` request in `FetchDataFromEndpoint` throws (e.g., 503, connection refused, timeout, or any 4xx/5xx) and the failure is logged
- **THEN** the emitted log event contains no `Authorization` value, no `Bearer` token string, and no certificate/private-key/passphrase, and does not include the Axios request `config` or `request` objects

#### Scenario: Push failure logs a redacted error

- **WHEN** an `axios` request in `PushDataToEndpoint` throws and the failure is logged
- **THEN** the emitted log event contains no `Authorization` value, no `Bearer` token string, and no certificate/private-key/passphrase, and does not include the Axios request `config` or `request` objects

### Requirement: Propagated proxy errors carry no credentials

The error object re-thrown by `FetchDataFromEndpoint` / `PushDataToEndpoint` on failure SHALL NOT carry credential material, so that any downstream handler that logs the propagated error cannot leak it.

#### Scenario: Downstream logging of a propagated non-service-unavailable error is safe

- **WHEN** a proxy request fails with an error that is not treated as service-unavailable (e.g., HTTP 404) and the error propagates to a downstream caller (a page `getServerSideProps` or an `/api/*` handler) that logs it
- **THEN** the logged error contains no `Authorization` value, no bearer token, and no certificate/key/passphrase

### Requirement: Safe diagnostics are retained

The redacted error used for logging and propagation SHALL retain non-secret diagnostic fields so failures remain diagnosable: the error `name`, `message`, error `code` (when present), and the HTTP response `status` (when present).

#### Scenario: Redacted error keeps status and message

- **WHEN** a proxy request fails with an HTTP error response (e.g., status 404)
- **THEN** the redacted error still exposes the HTTP `status` and a human-readable `message`, and (when present) the error `code`

### Requirement: Existing service-unavailable handling is preserved

Redaction SHALL NOT change the console's existing failure behavior: a 502/503 or connection failure SHALL still be surfaced as a service-unavailable condition, and `isServiceUnavailableError(...)` SHALL still detect it, so pages continue to render their service-unavailable state.

#### Scenario: 503 still yields a service-unavailable result

- **WHEN** a proxy request fails with HTTP 503 (or a connection error such as ECONNREFUSED)
- **THEN** the failure is still recognized as service-unavailable by `isServiceUnavailableError(...)` and the calling page still returns its `serviceUnavailable` state — with no credential material logged
