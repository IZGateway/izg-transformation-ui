# izg-transformation-ui (Xform Console) — Project Instructions

Next.js web app for managing IZ Gateway transformation pipelines. Package name: `izg-transformation-console`.
AWS ECS (Fargate) + nginx (provided by the base image) + Docker.

**Public repo** — follow IZ Gateway Public Repo Policy (in global CLAUDE.md).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16 — Pages Router** (NOT App Router) |
| Language | **TypeScript 5** |
| UI | **Material UI v5** + Emotion |
| Auth | **NextAuth.js v4** + Okta (OIDC) |
| Data | **SWR** + **axios** (API routes proxy to backend) |
| Drag & drop | **@dnd-kit** |
| Logging | **Winston** + `@elastic/ecs-winston-format` → Elasticsearch |
| Testing | **Jest** + **@testing-library/react**; Cypress for E2E |
| Linting | ESLint (`eslint.config.mjs`) + Prettier (`.prettierrc`) |
| Commits | Conventional Commits (commitlint + husky) |

---

## Architecture

### Pages Router — NOT App Router

Uses `src/pages/`. Do not use `app/` directory, server components, or `use client`. All pages are in `src/pages/`.

### API Proxy Pattern

All backend communication goes through Next.js API routes in `src/pages/api/`. These proxy to `XFORM_SERVICE_ENDPOINT`. Never call the backend directly from the browser.

Backend APIs: `/api/v1/pipelines`, `/api/v1/solutions`, `/api/v1/mappings`, `/api/v1/organizations`, `/api/v1/preconditions`, `/api/v1/healthcheck`

### Authentication

- NextAuth.js v4 with Okta OIDC
- `AdminGuard` HOC wraps admin-only pages
- `session.user.isAdmin` controls admin access
- Logout calls both NextAuth `signOut()` and Okta signout URL

### Data Model

- **Organization** — top-level; `id`, `organizationName`
- **Pipeline** — belongs to org; has `pipelineName`, `description`, `organizationId`, list of solutions
- **Solution** — `solutionName`, `version`, `description`, `active`, `id` (UUID)
- **Mapping** — belongs to org; has `notes` field (added v0.15.0)
- **Precondition** — conditions for solution execution

---

## Component Conventions

- Each component in `src/components/<Name>/index.tsx`
- Tests in `tests/` subdirectory within each component
- Use styled MUI + Emotion; use theme palette from `src/styles/theme/palette.ts` — never hardcode colors
- Wrap data-dependent sections in `<ErrorBoundary>`
- All main pages include `<AppHeaderBar>`, `<Footer>`, `<ErrorBoundary>`
- Use `data-testid` attributes on interactive elements

### Global State

`src/contexts/app.tsx` provides `AppProvider`. Use `useContext(CombinedContext)` — not a state management library.

---

## Code Style

- Explicit TypeScript types on props and function signatures; avoid `any`
- Run `npm run lint:fix` before committing
- Conventional Commits required: `feat:`, `fix:`, `chore:`, `refactor:`, etc.
- Named exports preferred in `src/lib/` and `src/utility/`

---

## Local Development

```cmd
copy .env.example .env
npm install --force
npm run dev -- --port 80
```

Or full Docker stack: `npm run start:local-dev`

---

## Commands

```cmd
npm test
npm run type-check
npm run lint
npm run code-quality-check
```

---

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `OKTA_CLIENT_SECRET` / `OKTA_CLIENT_ID` | Okta auth |
| `XFORM_SERVICE_ENDPOINT` | Backend API base URL |
| `XFORM_SERVICE_ENDPOINT_CRT_PATH` / `_KEY_PATH` / `_PASSCODE` | mTLS to backend |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth config |
| `ELASTIC_API_KEY` / `ELASTIC_HOST` / `ELASTIC_INDEX` | Elasticsearch logging |

See `CONFIGURATION.md` for the full list. Copy `.env.example` to `.env` — never edit `.env.example`.

---

## CI/CD

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | Push to `release/**` or PR to `develop` | Build Docker + deploy to Dev ECS |
| `create-image.yml` | Manual | Generate release timestamp |
| `create-release-branch.yml` | Manual | Create release branch + build/push image |
| `security-updates.yml` | Daily 3:15 AM UTC | CVE/dependency updates |
| `gitleaks.yml` | PRs | Secret scanning |

Use `@izgateway/dependency-scripts` for CVE automation — do not write custom update scripts.

---

## Known Deprecation Notes (IGDD-2804)

Goal: zero `npm warn deprecated` on a fresh `npm install`. Mirrors the fixes in izg-configuration-console.

- **react-axe / ts-node-dev:** removed (unused devDeps). `@axe-core/react` is the in-use a11y checker (`src/pages/_app.tsx`).
- **inflight:** eliminated by removing all `glob@7` consumers (it was a `glob@7` dep).
- **glob (all transitive):** the glob maintainer deprecates *every* version below the latest (`glob@7`/`@10`/`@11`). Root override `glob: ^13.0.6` forces every consumer (jest 30, rimraf, test-exclude, swagger-jsdoc) onto glob@13 (Node 18/20/≥22; keeps the v9+ API).
- **jest@30:** upgraded from 29 to drop the old glob@7/test-exclude chain (`jest-environment-jsdom` was already 30). `ts-jest@29.4.11` is jest-30 compatible (peer accepts `^29||^30`).
- **rimraf:** bumped to `^6.1.3` so its native `glob@^13` pairing matches the override.
- **swagger-jsdoc:** override `^6.3.0` (its glob is then forced to 13 by the glob override).
- **lodash.get / lodash.isequal:** override `@apidevtools/swagger-parser` → `^10.1.0`, which replaced `z-schema` with `ajv`, dropping both micro-packages.
- **whatwg-encoding (Xform-specific):** `whatwg-encoding@3.1.1` is the latest published version AND is deprecated (use `@exodus/bytes`). It was pulled by `jest-environment-jsdom@30 → jsdom@26`. Override `jsdom: ^28.1.0` (jsdom 28 dropped whatwg-encoding in favor of `@exodus/bytes`); proven compatible with jest-environment-jsdom@30.
  - **Test-env follow-on — known limitation:** jsdom@28 pulls `html-encoding-sniffer@6`, which does a CommonJS `require()` of the ESM-only `@exodus/bytes` (upstream packaging bug), so `npm test` fails jsdom suites with `ERR_REQUIRE_ESM`. CC (izg-configuration-console) hit the identical issue and confirmed it pre-dates the deprecation work there. `transpilePackages` does not fix it (the bad `require()` is at runtime inside untransformed node_modules). Tracked for a separate follow-up. If tests must pass before that, revert to `jsdom@26` (CJS `whatwg-encoding`, reintroduces that dev-only deprecation) or await an upstream fix.
- **git-raw-commits:** bumped `@commitlint/cli` + `@commitlint/config-conventional` 17 → `^20.5.3`. commitlint ≤19 pulls `git-raw-commits@2`/`@4` (both deprecated); v20 uses `git-raw-commits@^5` (clean) while still allowing Node ≥18. (v21 requires Node ≥22.12.)
- **@mui/base (CANNOT eliminate yet):** pulled transitively by `@mui/lab@5` and `@mui/x-date-pickers@6`. *Every* published `@mui/base` version is deprecated (renamed to `@base-ui-components/react`); no maintained version to override to. Removing it requires migrating the MUI stack off v5 (separate CR). This is the one expected residual deprecation warning.

## Active Work

| CR | Ticket | Status |
|---|---|---|
| `xform-console-user-guide` | [IGDD-2517](https://izgateway.atlassian.net/browse/IGDD-2517) | In progress |

Key open epics: [IGDD-1780](https://izgateway.atlassian.net/browse/IGDD-1780) (RBAC), [IGDD-1495](https://izgateway.atlassian.net/browse/IGDD-1495) (Solution mgmt)

Active tickets:
- [IGDD-2887](https://izgateway.atlassian.net/browse/IGDD-2887) — Playwright E2E framework
- [IGDD-2699](https://izgateway.atlassian.net/browse/IGDD-2699) — Group/Role Mapping management
- [IGDD-2698](https://izgateway.atlassian.net/browse/IGDD-2698) — Sender management system
- [IGDD-2697](https://izgateway.atlassian.net/browse/IGDD-2697) — User management system
- [IGDD-2533](https://izgateway.atlassian.net/browse/IGDD-2533) — Mapping management system
