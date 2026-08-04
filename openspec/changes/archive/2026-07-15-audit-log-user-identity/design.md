## Context

The Transformation Console logs through a single Winston instance (`logger.ts` at the repo root) whose format is currently a bare `ecsFormat({ convertReqRes: true, apmIntegration: false })`. `console.*` is monkey-patched to route through that logger, and in production a `File` transport writes `logs/log.json`, which filebeat ships to Elasticsearch.

Today, user identity is attached to only a couple of places, as a **bare `user` (email) string**:
- `logRequest` (`src/pages/api/api-middleware-helper.ts`) logs `user` on the "API Request" line — but `logRequest` is **opt-in** (only `captureErrors` is a default middleware), so most API routes emit no request line at all.
- `checkAccessToDestId` / `checkAccessToDestIdSlug` log `user` on the "Unauthorized access attempt" warning.

Everything else — `captureErrors` errors, `console.error` in `getServerSideProps`, the proxy helpers' `console.error`, any handler `console.*` — carries no identity. There is no reliable way to trace a log event back to the user who caused it.

**Key difference from the Configuration Console** (where the equivalent change is already shipped):
- The Configuration Console already had an `AsyncLocalStorage` request context (`src/lib/Context.ts`) populated by `withMiddleware`. **This repo has none** — the context infrastructure must be built from scratch.
- The Configuration Console reads directly from **DynamoDB** in `getServerSideProps`, so the headline benefit there was attributing downstream DB-layer logs. **This repo has no database**; server-side data access is proxied to the Xform Service via `fetchDataFromEndpoint`/`pushDataToEndpoint`, which log only a `console.error` on failure. So the attribution payoff on SSR pages is modest today, but wrapping them keeps coverage uniform and future-proof.
- RBAC differs: the Configuration Console resolves a single `role`; this repo uses a `roles: XformRole[]` array + `isAdmin` (`src/lib/rbac.ts`).

The next-auth `jwt` callback already decodes `account.id_token` (to read groups), so `auth_time`/`jti` are available there at sign-in. `sub` lives on the JWT but is **not** exposed on the session, so it must be read via `getToken({ req })`.

**Backward-compatibility constraint (the key design driver):** `user` is an established **string** field on existing log lines, and Kibana queries / an Elasticsearch mapping may depend on it. A field cannot be both a string and an object, so identity is carried under a **new** `sessionUser` key and nothing existing is touched.

Constraints: next-auth is pinned at v4 (Pages Router). The Edge middleware (`src/middleware.ts`) runs in the Edge runtime (no Winston, no `AsyncLocalStorage`) — but it emits no log line anyway, so it is simply not in scope.

## Goals / Non-Goals

**Goals:**
- Attach a `sessionUser` object — `{ name, userId, email, sessionId, jti, authTime, ip }` — to every Node-runtime log event during an authenticated interaction, automatically, **without changing any existing logged field**.
- Establish the request context for **every** API route (not just `logRequest` opt-ins) and for every wrapped `getServerSideProps`.
- Provide a `sessionId` that is stable within a login session, non-replayable, and not a secret; record the Okta `jti` and `authTime` alongside.
- Support indirect Okta correlation (`userId` + `authTime` + `ip`).
- Capture a point-in-time authorization snapshot (`groups` + `roles`) once per login.

**Non-Goals:**
- Modifying, removing, or renaming any field logged today (explicitly additive).
- Adding an app-version stamp (the console logs none today; out of scope).
- Pursuing the Okta `sid` / Front-Channel-SLO direct-correlation path now (documented future option).
- Enriching the Edge middleware (`src/middleware.ts`) — it emits no log.
- Any change to authentication, authorization, jurisdiction scoping, or the `tokenStore` access-token handling.

## Decisions

### D1 — Build the request context (`AsyncLocalStorage`) from scratch

Add a small module (e.g. `src/lib/Context.ts`) exporting a `Context` type — `{ user?, ipAddress?, sub?, userId?, email?, name?, sessionId?, jti?, authTime?, session? }` — and `asyncRequestContext = new AsyncLocalStorage<Context>()`. This is the Node-runtime analog of the Hub's SLF4J MDC.

- **Alternatives rejected:** threading identity through function args (invasive, does not capture `console.*`); per-request child loggers (re-introduces threading, misses `console.*`).

### D2 — Inject `sessionUser` via a context-aware Winston format (additive)

Restructure `logger.ts` from a bare `ecsFormat(...)` into `winston.format.combine(sessionUserFormat, ecsFormat({ convertReqRes: true, apmIntegration: false }))`. `sessionUserFormat` calls `asyncRequestContext.getStore()` and, when an authenticated context is present, sets `info.sessionUser = { name, userId, email, sessionId, jti, authTime, ip }`. It writes **only** the new `sessionUser` key — it never touches `user` or any other field. When there is no store, it no-ops (never throws). Placed **before** `ecsFormat` so the field is present at serialization. Because `console.*` is already monkey-patched to the logger, this covers `logger.*` and legacy `console.*` with zero per-call-site changes.

- **Passthrough risk:** unlike the Configuration Console (which had a `versionFormat` already proving custom fields survive `ecsFormat`), this repo has no custom log field today. A unit test SHALL assert the serialized output contains the `sessionUser` object.

### D3 — Extract a shared `buildRequestContext(req, res)` and establish context in two places

Add `src/lib/requestContext.ts` with `buildRequestContext(req, res): Promise<Context>` that resolves the session via `getServerSession(req, res, authOptions)` and the token via `getToken({ req })`, producing `{ user, ipAddress, sub, session, userId: sub, email, name, sessionId, jti, authTime }`. `ipAddress` is derived from `x-forwarded-for` (first hop) or the socket address. The same builder feeds both entry points below so they cannot drift.

- **Import note:** the helper imports `authOptions` from `src/pages/api/auth/[...nextauth]` (as `withMiddleware` already does). If an import cycle appears, pass `authOptions` in as a parameter.

### D4 — Establish context for API routes by wrapping the whole composed chain

Wrap the **entire** `next-api-middleware` composition in `asyncRequestContext.run(...)` at the `withMiddleware` level, rather than adding an inner context middleware. `withMiddleware(...labels)(handler)` builds the `Context` via `buildRequestContext(req, res)` and returns `asyncRequestContext.run(context, () => composed(req, res))`, where `composed` is the underlying labeled executor. This attributes **every** API route (all middleware + the handler) regardless of whether the route opts into `logRequest`.

- **Why not an inner `establishContext` middleware (approach rejected during implementation):** `next-api-middleware`'s `next()` does **not** invoke the downstream chain synchronously — it resolves a cleanup promise and schedules the remaining middleware via `queueMicrotask` **outside** the calling middleware's execution. So `asyncRequestContext.run(ctx, () => next())` inside a middleware would tear its store down before the handler runs, and `getStore()` in the handler returns `undefined` (verified by a failing test). Wrapping the whole composed chain keeps the store active across the library's internal deferral.
- The existing `logRequest`/`captureErrors`/`checkAccessToDestId*` bodies are unchanged; their existing `user` field stays exactly as-is (D6).

### D5 — Establish context for page renders via `withRequestContext(getServerSideProps)`

In `src/lib/requestContext.ts` add a higher-order wrapper:

```text
export function withRequestContext(handler) {
  return async (context) => {
    const requestContext = await buildRequestContext(context.req, context.res)
    return asyncRequestContext.run(requestContext, () => handler(context))
  }
}
```

Apply it uniformly to all five SSR pages (`manage`, `solutions`, `mapping`, `edit/pipeline/[id]`, `add/pipeline`). The wrapper runs the entire handler inside the context, so the page's server-side logs (today: the `console.error` on a backend-fetch failure) and any downstream logs carry `sessionUser`. Making coverage a property of the wrapper (not each author) means future SSR pages are attributed by construction.

### D6 — `sessionId` (console-generated) + `jti`/`authTime` (token references); indirect correlation

In the `jwt` callback's `if (account)` block: generate `token.sessionId = crypto.randomUUID()`, and decode `account.id_token` (reusing the existing `base64UrlDecode` helper) to capture `token.authTime` (`auth_time`) and the Okta ID-token `jti`. Persisting these on the token makes them available cheaply via `getToken()` without re-decoding per request.

- **Reserved-claim gotcha (found in manual verification):** the Okta jti must be stored under a **non-reserved** key — `token.oktaJti`, not `token.jti`. NextAuth's JWT `encode` unconditionally runs `.setJti(uuid())` when it writes the session cookie, so anything placed in the reserved `jti` claim is overwritten by a fresh NextAuth UUID (and rotates on re-encode). `buildRequestContext` reads `token.oktaJti` and maps it to `sessionUser.jti`. `sessionId`/`authTime` are unaffected because they are custom keys. The once-per-login `Session established` record was already correct because it logs the local variable before encoding.
- **`sessionId`** (UUID) is the stable, console-owned per-login correlator: non-replayable, not a secret, survives token refresh.
- **`jti`/`authTime`** are token references logged inside `sessionUser`.
- **Indirect Okta correlation** uses `userId` (`sub`) + `authTime` + `ip`.
- **Not pursued — Okta `sid`.** Requires enabling Front-Channel SLO in Okta. If later required, `token.sessionId` simply sources from `sid` — a drop-in source swap, no other change.

### D7 — Per-session authorization snapshot (`Session established`)

Okta group membership is mutable, so reconstructing "what was this user authorized to do at the time" later is impractical. In the `jwt` callback's `if (account)` block (runs once per login), emit a single `Session established` record containing the `sessionUser` identity (minus `ip`, which is per-request and unavailable in the callback) plus `groups` (the merged Okta memberships) and `roles` (from `getRolesFromGroups`). Ordinary per-line events carry `sessionUser` but **not** `groups`/`roles` (data minimization) while remaining recoverable via `sessionUser.sessionId`. This record is built explicitly (the auth route is not wrapped by `withMiddleware`, so the D2 format does not auto-inject there).

### D8 — Field shape & naming

`sessionUser` is a custom (non-ECS) field, chosen to avoid colliding with ECS's reserved `user` object **and** with the existing `user` string field. Sub-fields are camelCase: `name`, `userId`, `email`, `sessionId`, `jti`, `authTime`, `ip`. Shape is identical to the Configuration Console for cross-app consistency in Elastic. Type augmentation for `sessionId`/`authTime`/`oktaJti` goes in `src/next-auth.d.ts`'s `JWT` interface (`oktaJti`, not `jti` — see D6's reserved-claim note).

### D9 — Activity logging scope (decided during manual verification)

The data API routes opt into `logRequest` (`withMiddleware('logRequest')`), so every authenticated `/api/*` request emits an `API Request <url>` info line carrying `user` + `statusCode` + `sessionUser` — matching the Configuration Console, where request logging is a default middleware. This covers all writes (create/edit/delete of mappings, pipelines, solutions) and all client-side reads (e.g. `/add/mapping`'s org fetch, `/add|edit/solution`'s operations/preconditions).

Scope decisions made deliberately here:
- **Healthchecks stay quiet** (bare `withMiddleware()`, no `logRequest`) to avoid logging orchestrator poll spam — a deliberate improvement over CC, which logs its healthchecks.
- **Server-rendered read pages are NOT separately logged.** `/manage`, `/solutions`, `/mapping`, `/add|edit/pipeline` fetch via `getServerSideProps` → `fetchDataFromEndpoint` directly (never hitting an `/api` route), so a successful render logs nothing. This **matches CC** — CC's `withRequestContext` also only establishes context and emits no page-load line; CC merely appears chattier because more of its reads flow through client-side `/api` calls. Adding per-page-view logging (an info line in `withRequestContext`) was considered and declined to stay aligned with CC; it can be a follow-up if navigation auditing is ever required.

## Risks / Trade-offs

- **`ecsFormat` could transform/drop a custom field** → `sessionUser` is a custom (non-ECS-reserved) key; passthrough expected. Mitigation: a unit test asserting the serialized output contains the `sessionUser` object (no prior custom field exists here to lean on).
- **`AsyncLocalStorage` + `next-api-middleware` composition** → `next-api-middleware` defers downstream execution via `queueMicrotask`, so an inner `run(ctx, () => next())` middleware does not keep the store active for the handler. Mitigation (implemented): wrap the whole composed chain in `run()` at the `withMiddleware` level (D4); covered by a middleware test asserting a real logged line inside a wrapped handler carries `sessionUser`.
- **No request context on some paths** (startup, background, unauthenticated) → `sessionUser` is omitted; the format must never throw on an empty store. Covered by spec scenarios/tests.
- **Refactor of the API hot path** → `establishContext` runs on every API request; keep it minimal (one `getServerSession` + one `getToken`, already the cost `logRequest`/`checkAccess*` pay). The existing `logRequest` behavior is unchanged.
- **`groups`/`roles` are authorization metadata** → logged only once per session, in a record that should be access-controlled like any identity-bearing log. Not a credential; not replayable.
- **PII in logs** (email/name/ip) → intended audit behavior. No raw tokens/cookies logged; `sessionId` is an opaque console id.
- **Indirect Okta correlation** → a console-generated `sessionId` is not in Okta's logs, so correlation is a two-step join on `userId` + `authTime` + `ip` (same recipe as the Configuration Console). The `sid` option (not pursued) would make it one step at the cost of an Okta config change.
- **Modest SSR payoff today** → with no DB, wrapped `getServerSideProps` mainly attributes backend-fetch error logs. Accepted: uniform coverage + future-proofing outweigh the small immediate gain.

## Migration Plan

Purely additive and backward-compatible — no breaking changes, no existing field altered.
1. Add `Context` + `asyncRequestContext` (D1) and the context-aware format in `logger.ts` (D2).
2. Add `buildRequestContext` + `withRequestContext` (D3/D5); add `establishContext` default to `withMiddleware` (D4).
3. `jwt` callback: generate `sessionId`, capture `authTime`/`jti`, emit `Session established` (groups + roles) (D6/D7). Takes effect on next sign-in; existing sessions lack `sessionUser` until re-login.
4. Wrap the five SSR pages (D5); augment `next-auth.d.ts` (D8).

New `sessionUser.*` fields auto-discover in the Kibana index on first event; no mapping-template change, and the existing `user` mapping is untouched. **Rollback:** revert the change; logs return to prior behavior with no data migration.

## Open Questions

- None blocking. Future option: adopt Okta `sid` for a one-step Okta pivot (requires Front-Channel SLO config) — drop-in source swap for `sessionId`. Future option: an app-version stamp on log lines (a separate change).
