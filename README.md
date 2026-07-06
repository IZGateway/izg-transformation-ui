# Xform Console

This project contains source code for Xform Console. This is written using the following technologies:

- NodeJS
- NextJS
- NextAuthJS
- Material UI
- Docker Compose

## Usage for local development

The following prerequisites must be met for the first-time install and run the application on a local environment

- NodeJS installed and active
- Docker & Docker compose installed
- Okta account for the localhost client

### Step 1: Create .env file in project root directory

Running the application either via npm or via Docker will use the .env file.

_Copy_ the .env.example file in the repository to .env and update. **DO NOT** edit .env.example.

### Step 2: Install Dependencies

Install dependencies by running

```
npm install --force
```

### Step 3: Start local application

Run

```bash
npm run dev -- --port 80
```

This will start the application on port 80. The development Okta has redirects setup on http://localhost port 80.

### After start

Navigate to http://localhost:3000 in a browser and you should see the application prompt you for a okta login

## User Guide

A task-based user guide for the Transformation Console is maintained at
[`public/help/index.md`](public/help/index.md). It covers login, navigation, mappings,
solutions, and pipelines, with screenshots captured against the test environment.

The guide is also available as in-app help — click the **?** button on any page to open
the relevant guide section in a side panel.

## End-to-end testing: Playwright

End-to-end tests live in [`e2e/`](e2e/) and run against a deployed Xform Console
environment (the dev console by default). They cover Okta login/logout, the three
primary sections (Manage Pipelines, Solutions Creator, Mapping) and reordering
solutions within a pipeline, across Chrome, Firefox and WebKit.

### Setup

1. Install dependencies: `npm install --force`
2. Install the browsers: `npx playwright install --with-deps`
3. Copy `.env.test.example` to `.env.test` (git-ignored) and fill in:
   - `BASE_URL` — the environment to test against (defaults to `https://dev.xform-ui.izgateway.org`)
   - `OKTA_USERNAME` / `OKTA_PASSWORD` — an Okta account assigned to the Xform app
   - `OKTA_EXPECTED_FULLNAME` _(optional)_ — header name asserted after login
   - `SLOWMO` _(optional)_ — slow each action by N ms for debugging

### Running

```bash
npm run test:e2e          # headless, all browsers (Chrome, Firefox, WebKit)
npm run test:e2e:chrome   # headless, Chrome only
npm run test:e2e:dev      # Chrome, headed (local debugging)
npm run test:e2e:report   # open the last HTML report
```

A single Okta login is performed once by the `setup` project and reused across the
browser projects (saved to `e2e/.auth/user.json`). The login/logout spec runs in a
fresh, unauthenticated context.

Reports are written to `playwright-report/` (HTML).

### CI

The [`playwright-nightly.yml`](.github/workflows/playwright-nightly.yml) workflow runs the
suite headless on a weekday nightly schedule (and via manual dispatch) and uploads the
HTML report as a CI artifact.

> The tests are read-only — they open create/edit forms and the reorder UI but never
> submit, so the dev backend is not mutated.
