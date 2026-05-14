# Tasks: Xform Console User Guide

## 1. Dependencies and Infrastructure

- [x] 1.1 Add `markdown-it` to `package.json` as a production dependency and `@types/markdown-it` as a dev dependency
- [x] 1.2 ~~Add `react-markdown` to `transpilePackages`~~ — not needed; `markdown-it` is CJS-compatible; no `next.config.js` changes required
- [x] 1.3 Create `public/help/images/` directory with a `.gitkeep` placeholder

## 2. HelpPanel and HelpButton Components

- [x] 2.1 Create `src/components/HelpButton.tsx` — MUI `<IconButton>` with `HelpOutline` icon and `aria-label="Help"`
- [x] 2.2 Create `src/components/HelpPanel.tsx` — MUI `<Drawer>` that accepts `docPath`, `title`, `open`, and `onClose` props; fetches `/help/${docPath}.md` at runtime; renders response body as HTML using `markdown-it` with `dangerouslySetInnerHTML`
- [x] 2.3 Handle loading and error states in `HelpPanel`: show a spinner while fetching; show a fallback message if the fetch fails or the file is not found
- [x] 2.4 Verify that relative image paths in rendered Markdown (e.g., `../images/pipeline-list.png`) resolve correctly within the panel; adjust base URL or image rendering if needed

## 3. public/help/ Structure and Index

- [x] 3.1 Create `public/help/index.md` — table of contents linking to every feature section; brief Xform Console description; version note placeholder (`{version}`)
- [x] 3.2 Update `README.md` to add a "User Guide" section linking to `public/help/index.md`
- [x] 3.3 Create stub files for unimplemented features with the `<!-- TODO: IGDD-XXXX -->` pattern:
  - `public/help/users.md` — stub for [IGDD-2697](https://izgateway.atlassian.net/browse/IGDD-2697) (Manage Users)
  - `public/help/senders.md` — stub for [IGDD-2698](https://izgateway.atlassian.net/browse/IGDD-2698) (Manage Senders)
  - `public/help/group-role-mappings.md` — stub for [IGDD-2699](https://izgateway.atlassian.net/browse/IGDD-2699) (Manage Group Role Mappings)

## 4. Guide Content — Navigation and Login

- [x] 4.1 Write `public/help/login.md` — login entry point, Okta redirect flow, session handling and expiry; include screenshot references using the ADT→FHIR example scenario
- [x] 4.2 Write `public/help/navigation.md` — application shell, AppHeader elements, nav links, error page with helpdesk link, 404 page

## 5. Guide Content — Mappings

- [x] 5.1 Create `public/help/mappings/` directory
- [x] 5.2 Write `public/help/mappings/index.md` — Mappings list page: search/filter, snackbar notification pattern, navigating to edit; use `IIS-ADT-Field-Map` as the example mapping name
- [x] 5.3 Write `public/help/mappings/create-edit.md` — create a new mapping, edit an existing mapping, disable a mapping from the edit page

## 6. Guide Content — Solutions

- [x] 6.1 Create `public/help/solutions/` directory
- [x] 6.2 Write `public/help/solutions/index.md` — Solutions list page: search/filter, navigating to edit; note that solutions must be created before pipelines; use `ADT-to-FHIR-v2` as the example solution name
- [x] 6.3 Write `public/help/solutions/create-edit.md` — create a new solution, edit an existing solution
- [x] 6.4 Write `public/help/solutions/operations.md` — configuring Operations within a solution
- [x] 6.5 Write `public/help/solutions/preconditions.md` — configuring Preconditions as they appear in solutions

## 7. Guide Content — Pipelines

- [x] 7.1 Create `public/help/pipelines/` directory
- [x] 7.2 Write `public/help/pipelines/index.md` — Pipelines list page: search/filter, enable/disable toggle; note that pipelines require a solution; use `ADT-to-FHIR-IIS-Production` as the example pipeline name
- [x] 7.3 Write `public/help/pipelines/create-edit.md` — create a new pipeline, edit an existing pipeline, assign a solution
- [x] 7.4 Write `public/help/pipelines/preconditions.md` — configuring Preconditions within a pipeline

## 8. Playwright Screenshot Capture Script

- [x] 8.1 Create `scripts/capture-screenshots.js` (or `.ts`) — Playwright Chromium script that navigates to each wired page, clicks the `HelpButton`, asserts the drawer is visible with non-empty content, and closes it; uses `XFORM_BASE_URL` env var; exits non-zero on any failure
- [x] 8.2 Add a `capture-screenshots` script entry to `package.json` (e.g., `"capture-screenshots": "node scripts/capture-screenshots.js"`)
- [ ] 8.3 Run the capture script against the test environment and commit the resulting images to `public/help/images/`
- [x] 8.4 Write `public/help/contributing.md` — instructions for re-running the capture script: prerequisites (Node.js, Playwright, running Xform Console instance), the `XFORM_BASE_URL` env var, and the `npm run capture-screenshots` command

## 9. HelpPanel Wiring — Per Page

- [x] 9.1 Wire `HelpButton` + `HelpPanel` on the Login / Okta redirect page (docPath: `"login"`)
- [x] 9.2 Wire `HelpButton` + `HelpPanel` on the Navigation shell / AppHeader (docPath: `"navigation"`)
- [x] 9.3 Wire `HelpButton` + `HelpPanel` on the Mappings list page (docPath: `"mappings/index"`)
- [x] 9.4 Wire `HelpButton` + `HelpPanel` on the Mapping create/edit page (docPath: `"mappings/create-edit"`)
- [x] 9.5 Wire `HelpButton` + `HelpPanel` on the Solutions list page (docPath: `"solutions/index"`)
- [x] 9.6 Wire `HelpButton` + `HelpPanel` on the Solution create/edit page (docPath: `"solutions/create-edit"`)
- [x] 9.7 Wire `HelpButton` + `HelpPanel` on the Pipelines list page (docPath: `"pipelines/index"`)
- [x] 9.8 Wire `HelpButton` + `HelpPanel` on the Pipeline create/edit page (docPath: `"pipelines/create-edit"`)

## 10. Validation and Commit

- [x] 10.1 Verify `grep -r "TODO: IGDD" public/help/` reports only the three expected stubs (2697, 2698, 2699)
- [x] 10.2 Verify all `public/help/index.md` TOC links resolve to existing files
- [x] 10.3 Create `scripts/validate-help-panel.js` (or `.ts`) — Playwright Chromium script that navigates to each wired page, clicks the `HelpButton`, asserts the drawer is visible with non-empty content, and closes it; uses `XFORM_BASE_URL` env var; exits non-zero on any failure
- [x] 10.4 Add a `validate-help-panel` script entry to `package.json` (e.g., `"validate-help-panel": "node scripts/validate-help-panel.js"`)
- [ ] 10.5 Run `npm run validate-help-panel` against the test environment and confirm all pages pass
- [ ] 10.6 Commit all doc content, components, capture script, validation script, and config changes; open PR against main
