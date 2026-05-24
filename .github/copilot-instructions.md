# Copilot Instructions — izg-transformation-ui (Xform Console)

## Project Overview

**Xform Console** is a Next.js web application for managing IZ Gateway transformation pipelines. It provides a UI for administrators and Solutions Engineers to configure pipelines, solutions, and mappings used by the IZ Gateway Transformation Service backend.

- **Package name:** `izg-transformation-console`
- **Version cadence:** semantic versioning; see `RELEASE_NOTES.md`
- **Deployed on:** AWS ECS (Fargate), behind nginx, using Docker
- **Jira component:** `Transformation Console`
- **OpenSpec repo:** CRs live in this repo under `openspec/changes/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** — **Pages Router** (NOT App Router) |
| Language | **TypeScript 5** |
| UI library | **Material UI v5** + Emotion |
| Auth | **NextAuth.js v4** + Okta (OIDC) |
| Data fetching | **SWR** + **axios** (API routes proxy to backend) |
| Drag & drop | **@dnd-kit** (used for solution reordering in pipelines) |
| Logging | **Winston** + `@elastic/ecs-winston-format` → Elasticsearch |
| Testing | **Jest** + **@testing-library/react**; Cypress for E2E |
| Linting | ESLint (`eslint.config.mjs`) + Prettier (`.prettierrc`) |
| Commits | Conventional Commits enforced via commitlint + husky |

---

## Architecture

### Pages Router — NOT App Router

This project uses **Next.js Pages Router** (`src/pages/`). Do not use `app/` directory conventions, server components, or `use client` directives. All pages are in `src/pages/`.

### API Proxy Pattern

All backend communication goes through **Next.js API routes** in `src/pages/api/`. These proxy requests to `XFORM_SERVICE_ENDPOINT` (the Xform Service backend). Never call the backend directly from the browser; always go through the Next.js API layer.

The backend APIs are:
- `GET/POST /api/v1/pipelines` — pipeline CRUD
- `GET/POST /api/v1/solutions` — solution CRUD
- `GET/POST /api/v1/mappings` — mapping CRUD
- `GET /api/v1/organizations` — organization lookup (read-only in UI)
- `GET /api/v1/preconditions` — precondition lookup
- `/api/v1/healthcheck`, `/api/v1/deephealthcheck` — health endpoints

### Authentication

- **NextAuth.js v4** with Okta as the OIDC provider
- `useSession()` hook used throughout for auth state
- `AdminGuard` HOC wraps admin-only pages — redirects non-admins to `/manage`
- `session.user.isAdmin` flag controls admin access
- Token revocation is checked before use (IGDD-1876)
- Logout calls both NextAuth `signOut()` and the Okta signout URL

### Data Model

The core entities:
- **Organization** — top-level entity; has `id` and `organizationName`
- **Pipeline** — belongs to an organization; has `pipelineName`, `description`, `organizationId`, list of solutions
- **Solution** — reusable transformation step; has `solutionName`, `version`, `description`, `active` flag, `id` (UUID)
- **Mapping** — transformation mapping; belongs to an organization; has a `notes` field (added in v0.15.0)
- **Precondition** — conditions for solution execution

---

## Navigation Structure

Three main sections accessible from the collapsible MUI Drawer (`src/components/Navigation/`):

| Label | Path | Description |
|---|---|---|
| Manage Pipelines | `/manage` | List, create, edit pipelines |
| Solutions Creator | `/solutions` | List, create, edit solutions |
| Mapping | `/mapping` | List, create, edit mappings |

Add/edit routes follow the pattern `/add/<entity>` and `/edit/<entity>/[id]`.

The drawer collapses to icon-only mode. The IZ Gateway logo is in the drawer header. Logout is at the bottom of the drawer.

---

## Component Conventions

- Each component lives in its own directory under `src/components/` with an `index.tsx` entry point
- Feature components may have sub-files (e.g., `CreatePipeline/pipelineInfo.tsx`, `pipelineActions.tsx`)
- Tests live in a `tests/` subdirectory within the component directory
- Use **styled MUI components** with Emotion for custom styling
- Use the **theme palette** from `src/styles/theme/palette.ts` — never hardcode colors
- Wrap data-dependent sections in `<ErrorBoundary>` 
- All main pages include `<AppHeaderBar>`, `<Footer>`, and `<ErrorBoundary>`
- Page titles are set via the `<Container title="...">` wrapper
- Use `data-testid` attributes on interactive elements for test targeting

### Global State

`src/contexts/app.tsx` provides `AppProvider` with:
- `pageSize` / `setPageSize` — table page size
- `isChangePasswordClicked` / `setIsChangePasswordClicked` — connection edit state
- `alert` / `setAlert` — global alert level/message

Use React Context via `useContext(CombinedContext)` — not a state management library.

---

## Code Style

- **TypeScript**: explicit types on props and function signatures; avoid `any` unless necessary
- **Prettier**: enforced on save (`.prettierrc`); run `npm run lint:fix` before committing
- **Conventional Commits**: required — `feat:`, `fix:`, `chore:`, `refactor:`, etc.
- **Imports**: no barrel re-exports; import directly from component paths
- **No default export for utilities** — named exports preferred in `src/lib/` and `src/utility/`

---

## Environment Variables

All required env vars are documented in `CONFIGURATION.md`. Key ones:

| Variable | Purpose |
|---|---|
| `OKTA_CLIENT_SECRET` / `OKTA_CLIENT_ID` | Okta auth |
| `NEXT_PUBLIC_OKTA_ISSUER` | Okta base URL |
| `XFORM_SERVICE_ENDPOINT` | Backend API base URL |
| `XFORM_SERVICE_ENDPOINT_CRT_PATH` / `_KEY_PATH` / `_PASSCODE` | mTLS to backend |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth config |
| `ELASTIC_API_KEY` / `ELASTIC_HOST` / `ELASTIC_INDEX` | Elasticsearch logging |

Copy `.env.example` to `.env` for local dev — never edit `.env.example`.

---

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | Push to `release/**` or PR to `develop` | Build Docker image + deploy to Dev ECS |
| `create-image.yml` | Manual (`workflow_dispatch`) | Generate release timestamp / prep image |
| `create-release-branch.yml` | Manual | Create release branch + build/push image |
| `security-updates.yml` | Daily 3:15 AM UTC + manual | Dependency & CVE updates via `@izgateway/dependency-scripts` |
| `gitleaks.yml` | PRs | Secret scanning |

**Workflow path filtering:** Workflow files ignore changes to other workflow files (except their own). See `.github/WORKFLOW_TRIGGERS.md` for the negated-path-pattern convention used here.

**Dependency updates:** Use `@izgateway/dependency-scripts` npm package for CVE/dependency automation — do not write custom update scripts.

---

## Testing

- **Unit/integration:** Jest + `@testing-library/react` — run with `npm test`
- **Type checking:** `npm run type-check` (tsc --noEmit)
- **Linting:** `npm run lint`
- **Full quality check:** `npm run code-quality-check` (lint + type-check)
- Tests live in `tests/` subdirectories within each component or API route
- Use `jest-environment-jsdom` for React component tests

---

## Documentation

- `README.md` — developer setup (local dev, Docker)
- `CONFIGURATION.md` — all environment variables
- `RELEASE_NOTES.md` — version history with linked Jira tickets
- `doc/` — **user-facing documentation** (created by CR `xform-console-user-guide`, IGDD-2517); use `doc/index.md` as entry point

Per IZ Gateway conventions, all project documentation goes in `doc/` (not `docs/` or `documentation/`).

---

## OpenSpec Change Management

CRs for this project live in `openspec/changes/`. Active changes:

| CR | Ticket | Status |
|---|---|---|
| `xform-console-user-guide` | [IGDD-2517](https://izgateway.atlassian.net/browse/IGDD-2517) | In progress |

When creating or modifying code for a CR:
1. Read `openspec/changes/<cr-name>/proposal.md` and `design.md` first
2. Mark tasks complete in `tasks.md` as work is done
3. Follow the spec-driven schema: proposal → specs → design → tasks

---

## Local Development

```bash
# First time
cp .env.example .env  # fill in values
npm install --force

# Run dev server (requires Okta localhost redirect on port 80)
npm run dev -- --port 80

# Or full Docker local stack
npm run start:local-dev
```

Navigate to `http://localhost:3000` after start.

---

## Key Open Epics (Jira)

| Epic | Description |
|---|---|
| [IGDD-1780](https://izgateway.atlassian.net/browse/IGDD-1780) | Role-Based Access Control |
| [IGDD-1413](https://izgateway.atlassian.net/browse/IGDD-1413) | Simulate sending a transformed message |
| [IGDD-1495](https://izgateway.atlassian.net/browse/IGDD-1495) | Console solution management |
| [IGDD-1782](https://izgateway.atlassian.net/browse/IGDD-1782) | Zip Code Fixer |
| [IGDD-1783](https://izgateway.atlassian.net/browse/IGDD-1783) | Auditing |
| [IGDD-1409](https://izgateway.atlassian.net/browse/IGDD-1409) | Pipeline import/export to local file |
| [IGDD-2014](https://izgateway.atlassian.net/browse/IGDD-2014) | Restrict access by group (RBAC) |

---

## Jira Ticket Reference

UI-tagged tickets for this component:

- [IGDD-2699](https://izgateway.atlassian.net/browse/IGDD-2699) — Xform Console: design and implement Group/Role Mapping management
- [IGDD-2698](https://izgateway.atlassian.net/browse/IGDD-2698) — Xform Console: design and implement Sender management system
- [IGDD-2697](https://izgateway.atlassian.net/browse/IGDD-2697) — Xform Console: design and implement User management system
- [IGDD-2533](https://izgateway.atlassian.net/browse/IGDD-2533) — Xform Console: design and implement Mapping management system
- [IGDD-1913](https://izgateway.atlassian.net/browse/IGDD-1913) — CC/Xform: Create automated UI smoke test for supported browsers

Other active tickets for this repo:

- [IGDD-2887](https://izgateway.atlassian.net/browse/IGDD-2887) — Xform Console: implement Playwright end-to-end test framework
- [IGDD-2517](https://izgateway.atlassian.net/browse/IGDD-2517) — Xform Console user guide (doc/ folder; includes Playwright screenshot script)
