## 1. Request context infrastructure

- [x] 1.1 Create `src/lib/Context.ts` exporting a `Context` type (`{ user?, ipAddress?, sub?, userId?, email?, name?, sessionId?, jti?, authTime?, session? }`) and `asyncRequestContext = new AsyncLocalStorage<Context>()`.
- [x] 1.2 Create `src/lib/requestContext.ts` with `buildRequestContext(req, res): Promise<Context>` that resolves the session via `getServerSession(req, res, authOptions)` and the token via `getToken({ req })`, populating `user`, `ipAddress` (x-forwarded-for first hop → socket address), `sub`, `userId` (=sub), `email`, `name`, `sessionId`, `jti`, `authTime`, `session`.
- [x] 1.3 In `src/lib/requestContext.ts` add `withRequestContext(handler)` — a `getServerSideProps` wrapper that builds the context and returns `asyncRequestContext.run(context, () => handler(context))`.

## 2. Logger injection

- [x] 2.1 Restructure `logger.ts` to `winston.format.combine(sessionUserFormat, ecsFormat({ convertReqRes: true, apmIntegration: false }))`.
- [x] 2.2 Implement `sessionUserFormat`: read `asyncRequestContext.getStore()`; when an authenticated context is present set `info.sessionUser = { name, userId, email, sessionId, jti, authTime, ip }` (writing ONLY the `sessionUser` key); when no store is present, no-op (never throw).

## 3. API-route context establishment

- [x] 3.1 In `src/pages/api/api-middleware-helper.ts` wrap the composed `next-api-middleware` chain so `withMiddleware(...labels)(handler)` builds the context via `buildRequestContext(req, res)` and returns `asyncRequestContext.run(context, () => composed(req, res))`. (Wrapping the whole chain — not an inner middleware — because next-api-middleware defers downstream execution via queueMicrotask, which would escape an inner run() scope.)
- [x] 3.2 Ensure every API route runs inside the context regardless of opting into `logRequest`. Leave `logRequest`, `captureErrors`, `checkAccessToDestId`, `checkAccessToDestIdSlug` bodies unchanged (existing `user` field preserved).

## 4. Sign-in: sessionId, token references, authorization snapshot

- [x] 4.1 In the `jwt` callback (`src/pages/api/auth/[...nextauth].ts`) `if (account)` block, generate `token.sessionId = crypto.randomUUID()`.
- [x] 4.2 Decode `account.id_token` (reuse `base64UrlDecode`) and persist `token.authTime` (`auth_time`) and `token.jti` (`jti`).
- [x] 4.3 Emit exactly one `Session established` log record per login containing the `sessionUser` identity (minus `ip`) plus `groups` and derived `roles` (from `getRolesFromGroups`). Ordinary log lines must NOT repeat `groups`/`roles`.
- [x] 4.4 Augment `src/next-auth.d.ts` `JWT` interface with `sessionId?: string`, `authTime?: number`, `jti?: string`.

## 5. Server-side page render coverage

- [x] 5.1 Wrap `getServerSideProps` with `withRequestContext(...)` in `src/pages/manage/index.tsx`.
- [x] 5.2 Wrap `getServerSideProps` with `withRequestContext(...)` in `src/pages/solutions/index.tsx`.
- [x] 5.3 Wrap `getServerSideProps` with `withRequestContext(...)` in `src/pages/mapping/index.tsx`.
- [x] 5.4 Wrap `getServerSideProps` with `withRequestContext(...)` in `src/pages/edit/pipeline/[id].tsx`.
- [x] 5.5 Wrap `getServerSideProps` with `withRequestContext(...)` in `src/pages/add/pipeline/index.tsx`.

## 6. Tests

- [x] 6.1 Unit test the logger format: serialized output for a line emitted inside a populated context contains the `sessionUser` object (proves `ecsFormat` passthrough); a line emitted with no store omits `sessionUser` and does not throw.
- [x] 6.2 Test `establishContext`/`withMiddleware`: a log emitted by a handler wrapped by `withMiddleware` carries `sessionUser`, including a route that does NOT opt into `logRequest`; existing `user` field remains on the `logRequest` line.
- [x] 6.3 Test the `jwt` callback: `sessionId` is generated (UUID) and stable across calls within a login, a new login yields a new `sessionId`, `authTime`/`jti` are captured, and exactly one `Session established` record (with `groups` + `roles`) is emitted per login; no raw JWT/access/ID token or cookie is logged.
- [x] 6.4 Test `withRequestContext`: a log emitted inside a wrapped `getServerSideProps` carries `sessionUser`; no session → no fabricated identity.

## 7. Verification

- [x] 7.1 Run `npm run code-quality-check` (lint + type-check) and `npm test`; fix any issues.
- [x] 7.2 Manually verify a real log line (API request and an SSR page load) emits `sessionUser` with all fields, existing `user` field is untouched, and a single `Session established` record appears once per login.
