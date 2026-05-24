# UI Documentation Process Notes

> **Purpose:** These are working notes capturing the methodology being developed
> while writing the Xform Console user guide (IGDD-2517). When the guide is
> complete, these notes will be distilled into a reusable Copilot skill for
> documenting any UI project.
>
> Notes are appended chronologically as the process evolves.

---

## 2026-05-14 — Starting Point: What We Did First

### Context

We were asked to write a user guide for the Xform Console (`izg-transformation-ui`),
a Next.js admin UI with no existing documentation. The originating ticket (IGDD-2517)
was vague about the approach; it had been converted from a Spike to a Task.

### Step 1: Understand why no docs exist

Before writing anything, we looked at the history. A prior ticket (IGDD-1813) had
attempted to add an in-app docs page — it was closed Won't Do because the team decided
documentation should live in GitHub. This told us:
- The format is settled: GitHub Flavored Markdown in `doc/`
- The audience is Solutions Engineers and IZ Gateway administrators
- In-app help is explicitly out of scope

**Lesson:** Always check the ticket history and any related closed/Won't Do tickets
before starting. They contain architectural decisions that constrain your approach.

### Step 2: Deeply familiarize with the codebase before writing anything

Rather than starting the proposal immediately, we did a full codebase exploration:
- Read `package.json`, `README.md`, `CONFIGURATION.md`, `RELEASE_NOTES.md`
- Read all page files (`src/pages/`) to enumerate every implemented route
- Read key components: `PipelinesTable`, `SolutionsTable`, `MappingTable`,
  `Navigation/menuItems.tsx`, `AppHeader`, `CreatePipeline`, `CreateSolution`,
  `CreateMapping`, `EditPipeline`
- Read the auth setup (`NextAuth` + Okta) and context providers
- Reviewed CI/CD workflows

This revealed the tech stack, data model, navigation structure, and — critically —
which UI areas were implemented and which were only stubs.

**Lesson:** Do not begin writing a user guide from tickets alone. The code is the
ground truth for what actually exists. Tickets may describe features that aren't
implemented yet, or features may exist with no ticket at all.

### Step 3: Inventory existing Jira tickets for UI features

We ran a Jira query for tickets tagged `UI` in the `Transformation Console` component:

```
project = IGDD AND component = "Transformation Console" AND labels = UI ORDER BY created DESC
```

This returned 5 tickets:
- IGDD-2699: Group/Role Mapping management (Open — not implemented)
- IGDD-2698: Sender management (Open — not implemented)
- IGDD-2697: User management (Open — not implemented, stub page only)
- IGDD-2533: Mapping management (Resolved — fully implemented)
- IGDD-1913: Automated UI smoke test spike (Resolved — led to CC Playwright suite)

**Lesson:** A Jira ticket label search gives you the explicitly planned features.
But it will miss anything built without a discrete ticket — which is common for
core foundational features.

### Step 4: Cross-reference code vs. tickets to find undocumented features

We enumerated all pages in `src/pages/` and compared them against the ticket list.
The gap was significant:

| Feature | In Code? | Has Ticket? |
|---|---|---|
| Pipeline management (list, create, edit, enable/disable) | ✅ | ❌ |
| Solutions Creator (list, create, edit) | ✅ | ❌ |
| Preconditions (sub-feature of pipelines and solutions) | ✅ | ❌ |
| Operations (sub-feature of solutions) | ✅ | ❌ |
| Mapping management | ✅ | ✅ IGDD-2533 |
| Login / Okta auth flow | ✅ | ❌ |
| Error page / 404 page | ✅ | ❌ |
| Snackbar success notifications | ✅ | ❌ |
| User management | stub only | ✅ IGDD-2697 |
| Sender management | ❌ | ✅ IGDD-2698 |
| Group/Role Mapping | ❌ | ✅ IGDD-2699 |

**Lesson:** Always inventory every page/route in the codebase. The biggest features
are often the ones with no ticket — they were built as the initial scaffold before
the team adopted a ticket-per-feature practice.

**Lesson:** Distinguish between "stub" (route exists, no real UI) and "implemented"
(functional UI). Stubs get a "Coming in a future release" placeholder, not real content.

### Step 5: Decide on the approach for each feature area

For **ticket-sourced features** (IGDD-2533, etc.):
- User story comes from the ticket description
- Success/failure criteria come from the ticket's acceptance criteria
- We already know the intended behavior

For **code-only features** (Pipelines, Solutions, etc.):
- User story must be inferred from the code and UX
- Success/failure criteria must be derived from the API contract and component behavior
- This requires reading the components carefully, not just the page files

### Step 6: Rethink the screenshot strategy

Initial assumption: write text-only guide, screenshots are optional.

Revised (after discussion): Screenshots are the highest-value element of a UI guide.
Without them, users can't orient themselves visually.

Key insight: A **full Playwright regression test suite** (IGDD-2887) is a significant
multi-sprint effort. But a **Playwright screenshot capture script** — no assertions,
Chromium only, just navigation + `page.screenshot()` — is an afternoon of work and
produces the same documentation images.

Decision: The screenshot script is part of the IGDD-2517 CR scope. The full test
suite (IGDD-2887) is tracked separately and will build on this foundation.

**Lesson:** Separate "Playwright for regression testing" from "Playwright for
documentation screenshots." They share the same tool but are different in scope,
effort, and purpose. Don't let the size of one block you from the value of the other.

---

## 2026-05-15 — Screenshot Capture: Technical Lessons

### The MFA problem

Playwright's automated login (`loginToOkta()`) breaks against Okta accounts with MFA
enabled. The solution: run the browser in **headed mode** (`headless: false`) and wait
for the user to log in manually.

```ts
await page.goto('/')
await page.waitForURL('**/manage**', { timeout: 120_000 })
// User has logged in — proceed with captures
```

The script opens a visible browser window, the user completes the Okta/MFA flow, and
Playwright takes over as soon as the post-login redirect completes.

**Lesson:** Headed mode + `waitForURL` is a clean, maintainable pattern for any
Playwright script that must run against an MFA-protected environment.

### Two-column layouts produce identical screenshots

Several Xform Console pages (solution edit, pipeline edit) render two panels
side-by-side. A full-page `page.screenshot()` captures both panels at once — meaning
the "Info" and "Operations" screenshots would be pixel-for-pixel identical.

Solution: clip each panel using a locator screenshot:

```ts
const settings = page.getByTestId('settings-container')
await settings.screenshot({ path: 'solution-info.png' })
// Full viewport for the paired panel
await page.screenshot({ path: 'solution-operations.png' })
```

`data-testid="settings-container"` is present on both `SolutionInfo` and
`EditPipeline/Settings` cards and works in both contexts.

**Lesson:** After capturing a batch of screenshots, hash every file and check for
duplicates before committing. `Get-FileHash *.png | Sort-Object Hash` catches this
immediately. Any duplicate hash is a bug in the script.

### Drawer state matters

The navigation drawer defaults to **collapsed** (icon-only). Two screenshots that both
capture the same page in collapsed state look identical. The fix: explicitly toggle the
drawer to expanded before the "navigation shell" screenshot, and let the "pipelines list"
screenshot keep the default collapsed state — two visually distinct images from the same
page.

### `networkidle` is not enough

React components continue rendering after the network goes quiet. Pages with async data
(solution edit, pipeline edit, mapping edit) needed an additional
`page.waitForTimeout(2000)` after `waitForNetworkIdle` to ensure content was fully
painted before the screenshot.

---

*See [ui-documentation-how-to.md](ui-documentation-how-to.md) for the distilled,
actionable process derived from these notes.*

This document describes the end-to-end process used to produce the Xform Console user
guide in IGDD-2517. Follow it when adding documentation for new features or when the
guide needs a significant update.

---

## Phase 1 — Prepare Before Writing Anything

### 1.1 Check ticket history for prior decisions

Before opening an editor, search Jira for closed or Won't Do tickets related to the
feature. Teams frequently make architectural decisions about where documentation lives
and how it is structured; those decisions are recorded in closed tickets, not in the
current ticket description. Skipping this step risks re-litigating settled choices.

For the Xform Console the decision was: guide content lives as GitHub Flavored Markdown
under `public/help/`; in-app help is delivered through a `HelpPanel` component that
fetches and renders those same files at runtime.

### 1.2 Inventory the codebase, not just the tickets

Read the code before writing a word of documentation. The code is the ground truth for
what actually exists. Key files to read:

- `src/pages/` — every implemented route
- `src/components/Navigation/menuItems.tsx` — the navigation structure users see
- Key feature components (tables, create/edit forms) to understand field names, actions,
  and validation behaviour

Build a table comparing what is in the code against what has a ticket:

| Feature | In Code | Has Ticket |
|---|---|---|
| Pipeline management | ✅ | ❌ |
| Solutions Creator | ✅ | ❌ |
| Mapping management | ✅ | ✅ IGDD-2533 |
| User management | stub only | ✅ IGDD-2697 |

The biggest features are often the ones with no ticket — they were built as the initial
scaffold before the team began tracking features per-ticket. **Stub pages** (route exists,
no real UI) get a "Coming in a future release" callout rather than real content.

### 1.3 Create an OpenSpec change request

Create an OpenSpec CR for any non-trivial documentation work:

```
openspec new change "xform-console-user-guide"
```

Write the artifacts in order — proposal → specs → design → tasks — before implementing
anything. The specs, in particular, help settle what is in scope (implemented features
with screenshots) vs. out of scope (stubs, admin-only infrastructure).

---

## Phase 2 — Content Structure

### 2.1 Folder layout

All guide content lives under `public/help/`. Organise it one folder per feature area:

```
public/help/
├── index.md                  # Table of contents / home page
├── login.md                  # Authentication flow
├── navigation.md             # Shell and sidebar
├── images/                   # Screenshots (committed to the repo)
├── mappings/
│   ├── index.md              # Feature overview
│   └── create-edit.md        # Task-focused detail page
├── solutions/
│   ├── index.md
│   ├── create-edit.md
│   └── operations.md
├── pipelines/
│   ├── index.md
│   └── create-edit.md
└── contributing.md           # How to update the guide and refresh screenshots
```

Create a separate `.md` file for each meaningful user task, not one large file per
feature. A user looking for "how do I add an endpoint to a pipeline?" should land on a
short focused page, not scroll through a megadoc.

### 2.2 Image path convention

Screenshots live in `public/help/images/`. Use **relative paths** so files render
correctly both in GitHub and when served by the app:

| File location | Image reference |
|---|---|
| `public/help/login.md` (top level) | `images/login.png` |
| `public/help/pipelines/create-edit.md` (subdirectory) | `../images/pipeline-info.png` |

### 2.3 Stub pages for unimplemented features

When a feature has an open ticket but is not yet built, create the `.md` file with a
single callout and a link to the tracking ticket so the file is wired and ready:

```markdown
> **Coming in a future release.**
> This feature is planned but not yet available. See IGDD-XXXX for status.
```

The developer who implements the feature owns filling in that stub.

---

## Phase 3 — In-App Help Wiring

The `HelpPanel` component renders any `public/help/*.md` file in a right-side drawer.
It fetches the file at runtime via a `fetch('/help/<docPath>.md')` call and renders it
with `markdown-it`, rewriting relative image paths to absolute `/help/images/` URLs so
they resolve correctly regardless of the current page.

### 3.1 Add a HelpButton to a page

```tsx
import HelpButton from '@/components/HelpButton'

// Inside the page component:
<HelpButton docPath="pipelines/index" title="Pipelines Help" />
```

`docPath` is the path relative to `public/help/`, without the `.md` extension.

### 3.2 Where to place the button

Place `HelpButton` in the `AppHeaderBar` for the page, or in the page title row if the
page has a consistent header. Avoid floating it — it should be predictable.

---

## Phase 4 — Screenshots

Screenshots are the highest-value element of a UI guide. Capture them with the
Playwright script (`e2e/tests/capture-screenshots.spec.ts`) rather than by hand.

### 4.1 Why Playwright, not manual screenshots

- Consistent viewport (1280 × 720), consistent zoom, consistent login state
- Reproducible — re-run after a UI change to refresh all 14 images in one command
- Can clip specific panels within a page (critical for multi-column layouts; see §4.4)

### 4.2 Running the script

The script requires a **headed browser** because the Xform Console uses Okta with MFA,
which cannot be automated. Set `headless: false` in `playwright.config.ts` (already the
default) and run:

```bash
npm run capture-screenshots
```

When the browser opens, sign in with your Okta credentials and complete any MFA
challenge. The script waits up to two minutes for the redirect to `/manage` and then
captures all screenshots automatically.

### 4.3 After running

Verify that no two screenshots are identical before committing:

```powershell
cd public/help/images
Get-FileHash *.png | Sort-Object Hash | Format-Table Hash, Path
```

Every row should have a unique hash. Duplicate hashes mean two screenshots captured the
same state (see §4.4).

Commit the images:

```bash
git add public/help/images/
git commit -m "docs: refresh user guide screenshots"
```

### 4.4 Multi-column layout pitfall

Several Xform Console pages use a two-column layout where both panels are visible
simultaneously (e.g., Solution edit: Info panel left, Operations/Preconditions panel
right; Pipeline edit: Settings left, Endpoints right). A full-page `page.screenshot()`
captures both panels in one image — the two page-level screenshots are then identical.

**Solution:** Use locator-based `element.screenshot()` to clip each panel individually:

```ts
// Clip the left settings panel
const settings = page.getByTestId('settings-container')
await settings.screenshot({ path: path.join(OUT_DIR, 'solution-info.png') })

// Full viewport for the right panel (operations/preconditions visible alongside)
await page.screenshot({ path: path.join(OUT_DIR, 'solution-operations.png') })
```

`data-testid="settings-container"` is present on both the `SolutionInfo` and
`EditPipeline/Settings` cards and can be reused in both contexts.

### 4.5 Navigation screenshots

The drawer defaults to collapsed (icon-only) on page load. To show both states:

- **Navigation shell screenshot** — click `aria-label="toggle navigation drawer"` to
  expand the drawer first, then screenshot. This shows the full labelled navigation.
- **Pipelines list screenshot** — taken after navigating to `/manage`; the drawer is
  collapsed to icon-only by default, giving a visually distinct comparison.

---

## Phase 5 — Completing the Work

1. Run the hash check (§4.3) to confirm all screenshots are unique.
2. Open each `.md` file locally in Edge or another markdown-rendering browser to visually
   verify images load and content looks correct.
3. Fix any broken image paths — the most common mistake is using `../images/` in a
   top-level file that should use `images/` (no `../`).
4. Commit everything to the feature branch.
5. Open a PR targeting `develop`.
6. Transition the Jira ticket to **Ready for Code Review** and clear the assignee.
7. Attach the screenshot images to the Jira ticket so reviewers can browse them without
   checking out the branch.

---

## Appendix: Adding a New Feature to the Guide

When a new UI feature is shipped:

1. Create `public/help/<feature>/index.md` and any task pages needed.
2. Add the feature to `public/help/index.md`.
3. Add a `HelpButton` to the new page(s) with `docPath="<feature>/index"`.
4. Add a screenshot step to `e2e/tests/capture-screenshots.spec.ts`.
5. Run the capture script and commit the new image.
6. Delete the stub file if one existed.

The developer who implements the feature owns steps 1–6. Documentation is part of
the Definition of Done, not a follow-up ticket.
