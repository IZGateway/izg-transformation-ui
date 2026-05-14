# Design: Xform Console User Guide

## Context

The Xform Console is a Next.js 16 / React 18 / MUI v5 application with no end-user
documentation. The user guide is a new artifact that must live alongside the code,
version with the app, and be maintainable by the same full-stack developer who owns the
corresponding UI feature.

The guide has two delivery modes from one source of truth:

1. **Standalone Markdown** — readable in GitHub, linkable from external sources
2. **Lite in-app help** — a `HelpPanel` component (MUI Drawer) that renders the
   same Markdown file when a user clicks the Help button on any page

## Goals / Non-Goals

**Goals:**
- Establish a `public/help/` folder structure that scales as new features ship
- Define the `HelpPanel` component interface so any developer can wire it up
- Specify the Playwright screenshot capture script scope and conventions
- Define the stub lifecycle for features not yet implemented
- Define the end-to-end example scenario used throughout screenshots
- Define full-stack ownership rules so documentation stays current

**Non-Goals:**
- A full in-app documentation site or dedicated route (Won't Do — IGDD-1813)
- Per-field tooltips or hover-triggered help (out of scope for this CR)
- API reference documentation
- Contributor / developer documentation (covered by `README.md`)
- Playwright regression testing (tracked separately — IGDD-2887)

## Decisions

### Decision 1: Folder-per-feature document structure

**Rationale:** A single flat folder of one file per feature is simple but breaks
down when a feature has multiple sub-pages (create, edit, list) that warrant distinct
screenshots and user flows. A folder-per-feature structure keeps related Markdown and
images co-located without merging unrelated content into one large file.

Guide files live in `public/help/` — the standard Next.js location for static assets
served at runtime. This eliminates any build-time copying or symlinking: the files are
already where Next.js expects them, served directly at `/help/*`.

**Structure:**

```
public/help/
  index.md                      # Table of contents; links to all sections
  images/                       # All screenshots from the Playwright capture script
    login-okta-page.png
    pipeline-list-populated.png
    pipeline-create-form-empty.png
    solution-list-populated.png
    mapping-list-snackbar.png
    ...
  login.md                      # Login and session; single page, single file
  navigation.md                 # AppHeader, nav shell, error page, 404
  contributing.md               # How to re-run the screenshot capture script
  pipelines/
    index.md                    # Pipelines list (search, filter, toggle)
    create-edit.md              # Create and edit pipeline
    preconditions.md            # Preconditions sub-section
  solutions/
    index.md                    # Solutions list
    create-edit.md              # Create and edit solution
    operations.md               # Operations sub-section
    preconditions.md            # Preconditions as they appear in solutions
  mappings/
    index.md                    # Mappings list (search, filter, snackbar)
    create-edit.md              # Create, edit, and disable mapping
```

All images live in `public/help/images/` regardless of which feature they belong to.
This keeps the Playwright script simple: it always writes to one directory without
needing to know the feature folder layout. Images are served at `/help/images/*.png`.

**Alternative considered:** Flat single-file-per-feature (e.g., `public/help/pipelines.md`).
Rejected because pipelines, solutions, and mappings each have three sub-pages (list,
create, edit) with distinct screenshots and flows that would make a single file
unwieldy and hard to link from the in-app `HelpPanel`.

---

### Decision 2: One source of truth — `public/help/` serves both delivery modes

**Rationale:** Guide Markdown files live in `public/help/`, which is the correct
location for static assets in a Next.js application. Files in `public/` are served
directly by Next.js at the corresponding URL path with no build configuration required.
The same files are readable in GitHub and fetched at runtime by the `HelpPanel` — no
duplication, no symlinks, no copy steps.

- A developer's PR that adds a new feature updates `public/help/<feature>/create-edit.md`
  and that change is immediately reflected in both the GitHub-readable guide and the
  in-app Help drawer.
- There is no risk of the two forms diverging.

**Implementation approach (Next.js):**

```tsx
// src/components/HelpPanel.tsx
// MUI Drawer + react-markdown; accepts a doc path relative to /public/help/
interface HelpPanelProps {
  docPath: string;  // e.g. "pipelines/create-edit"
  title: string;    // displayed in the drawer header
  open: boolean;
  onClose: () => void;
}
```

At runtime, `HelpPanel` fetches `/help/${docPath}.md` and renders it with
`react-markdown` + `remark-gfm`. No build step required.

**Alternative considered:** Import Markdown files as raw strings at build time using
Webpack/Next.js `raw-loader`. Rejected because it would bundle all help content into
the JavaScript bundle regardless of whether the user opens the panel, and would require
a rebuild when doc content changes (even if the UI code did not change).

---

### Decision 3: `HelpPanel` wired per-page via a page-level Help button

**Rationale:** Each page has a single Help button (?) in the page header area. Clicking
it opens the `HelpPanel` Drawer showing the guide section relevant to that page. This
is deliberately lightweight — one button per page, no per-field popovers.

**Wiring pattern:**

```tsx
// In a page component, e.g. PipelinesListPage
const [helpOpen, setHelpOpen] = useState(false);

return <>
  <PageHeader
    title="Pipelines"
    actions={<HelpButton onClick={() => setHelpOpen(true)} />}
  />
  <HelpPanel
    docPath="pipelines/index"
    title="Pipelines Help"
    open={helpOpen}
    onClose={() => setHelpOpen(false)}
  />
  ...
</>;
```

`HelpButton` is a small reusable icon button (`<IconButton>` with a `HelpOutline` MUI
icon). It is the developer's responsibility to add `HelpPanel` to each page they build
or modify — it is part of full-stack ownership.

---

### Decision 4: Full-stack ownership — doc updated in the same PR as the feature

**Rationale:** Documentation drift is caused by a gap between when UI code is written
and when documentation is written. Closing that gap requires that documentation is a
deliverable of the same PR, by the same developer.

**Policy:**

- Any PR that modifies a page's UI **MUST** update the corresponding `public/help/` Markdown file.
- Any PR that adds a new page **MUST** add the corresponding `public/help/` section and wire up
  `HelpPanel` for that page.
- The PR description checklist SHOULD include: `[ ] Updated public/help/<feature>/*.md`,
  `[ ] Re-ran Playwright capture script (or noted why screenshots were not refreshed)`.
- CI does not currently enforce this (adding a lint rule is a future improvement), but
  it is enforced through code review: reviewers check that the doc file was touched.

**Jira label enforcement:** Any IGDD ticket with the `ui` label triggers the above policy.
This will be discussed at the 2026-05-21 team meeting for formal adoption.

---

### Decision 5: Screenshot capture — Playwright script against test environment

**Rationale:** Screenshots must match what a user sees in a real running instance.
The test environment (`test.xform-console.izgateway.org` or equivalent) runs a fixed
version and is more stable than a local dev instance, which may have uncommitted or
experimental changes.

**Script conventions:**

- Script is committed to `scripts/capture-screenshots.js` (or `.ts`) at the repo root
- Target URL is set via environment variable `XFORM_BASE_URL`
- Browser: Chromium only (Playwright default)
- Output directory: `public/help/images/` (overwriting existing files)
- Naming: `<capability>-<state>.png`
  - Examples: `pipeline-list-populated.png`, `pipeline-create-form-empty.png`,
    `mapping-list-snackbar.png`, `login-okta-page.png`
- No assertions; script does not fail if optional elements are absent
- The script uses the **fictional end-to-end example scenario** (see Decision 6)
  to produce consistent screenshots across all sections

**When to re-run:** Any PR that changes a page's visual layout SHOULD re-run the
capture script and commit updated screenshots. The PR description checklist item
covers this.

---

### Decision 6: End-to-end example scenario

**Rationale:** Screenshots and step-by-step instructions that use consistent fictional
data are easier to follow than instructions with placeholder text (`<your-pipeline-name>`).
A named scenario also gives each guide section a clear "story" that connects to the next.

**Scenario: ADT→FHIR IIS Data Pipeline**

> Sam, a Solutions Engineer at a state immunization program, is configuring a new data
> pipeline to translate ADT (Admit, Discharge, Transfer) HL7 messages from the state's
> IIS into FHIR R4 resources for downstream analytics.

All screenshots and step-by-step examples use this scenario with the following fictional
data:

| Item | Value used in examples |
|---|---|
| Pipeline name | `ADT-to-FHIR-IIS-Production` |
| Solution name | `ADT-to-FHIR-v2` |
| Mapping name | `IIS-ADT-Field-Map` |
| Org / tenant | `StateIIS-Demo` |
| Base URL in screenshots | `https://test.xform-console.izgateway.org` |

The creation order in the guide narrative follows the dependency order: Mappings first,
then Solutions (which reference mappings), then Pipelines (which reference solutions).
This order is reflected in the guide's table of contents and in the walk-through sections.

---

### Decision 7: Stub lifecycle for unimplemented features

**Rationale:** The guide structure should be ready for features that are not yet shipped
(IGDD-2697 User Management, IGDD-2698 Sender Management, IGDD-2699 Group/Role Mapping)
so that the developer implementing those features can fill in the stub rather than
figure out where the content goes.

**Stub pattern:**

```markdown
## User Management

> ⚠️ **Coming in a future release.**
> This section will be completed when [IGDD-2697](https://izgateway.atlassian.net/browse/IGDD-2697)
> is implemented. <!-- TODO: IGDD-2697 -->

```

- The `<!-- TODO: IGDD-XXXX -->` HTML comment is machine-readable; a CI step
  (or a developer script) can `grep` for it to report guide completeness.
- The visible callout block tells readers the section is forthcoming.
- The stub is added by the author of this CR; it is filled in by the developer
  of the corresponding feature ticket.

---

### Decision 8: Versioning — guide is part of the app

**Rationale:** The guide documents the app as it exists at a given version. It is not a
separate artifact with its own release cadence.

- `public/help/` is committed to the same Git repository as the code.
- The guide's "version" is the app's Git tag / release tag (e.g., `v2.3.0`).
- `public/help/index.md` includes a note: "This guide documents the Xform Console as shipped
  in release `{version}`" — the version string is updated as part of the release PR.
- Historical versions of the guide are accessible via Git history.

---

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Screenshot freshness — images go stale if PRs skip the capture step | PR checklist + code review enforcement. Future: CI job that detects Playwright script was not re-run when `src/` changes in the same PR. |
| `react-markdown` version compatibility with Next.js 16 | Verify during implementation; `react-markdown` v9 is ESM-only and may require `next.config.js` `transpilePackages` configuration. |
| Stub sections remain unfilled if feature tickets don't reference the guide | `<!-- TODO -->` grep in CI; team policy that feature ticket includes doc update in Definition of Done. |

## Open Questions

1. **CI screenshot check**: Should a CI job verify that `public/help/images/` was updated when
   `src/pages/` or `src/components/` changed? If yes, this is a task for a follow-on CR,
   not this one.
2. **react-markdown version**: Confirm `react-markdown` ESM compatibility with the
   current Next.js + Webpack configuration before adding the dependency.
