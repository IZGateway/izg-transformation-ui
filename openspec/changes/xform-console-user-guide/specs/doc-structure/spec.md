# Spec: Documentation Structure

## ADDED Requirements

### Requirement: Folder-per-feature layout

The `doc/` folder at the repository root MUST be organised using a folder-per-feature
structure for features that have multiple sub-pages, and single files for simple
single-page features.

#### Scenario: Complex feature with sub-pages

WHEN the feature covers multiple routes (e.g., list, create, edit)
THEN it MUST have its own subdirectory under `doc/` (e.g., `doc/pipelines/`)
AND each sub-page or logical section within that feature MUST have its own `.md` file
  within that subdirectory (e.g., `doc/pipelines/index.md`, `doc/pipelines/create-edit.md`)

#### Scenario: Simple single-page feature

WHEN the feature covers a single route or a small self-contained topic
THEN it MAY be a single `.md` file directly under `doc/` (e.g., `doc/login.md`)

#### Scenario: Screenshot images

WHEN a guide section references a screenshot
THEN the image file MUST reside in `doc/images/`
AND the filename MUST follow the pattern `<capability>-<state>.png`
  (e.g., `pipeline-list-populated.png`, `mapping-list-snackbar.png`)

---

### Requirement: Entry point and table of contents

`doc/index.md` MUST serve as the single entry point for the user guide.

#### Scenario: Reader navigates to the guide

WHEN a user opens `doc/index.md`
THEN they see a table of contents linking to every feature section
AND the page includes a brief description of the Xform Console and its audience

#### Scenario: README links to the guide

WHEN a developer or user opens the repository `README.md`
THEN there MUST be a link to `doc/index.md` in a "Documentation" or "User Guide" section

---

### Requirement: Version notation

`doc/index.md` MUST include a version note identifying which app release the guide
documents.

#### Scenario: Guide version matches app release

WHEN a release PR is prepared
THEN `doc/index.md` MUST be updated to reflect the release version
AND the version note MUST read: "This guide documents the Xform Console as shipped
  in release `{version}`"

---

### Requirement: Stub sections for unimplemented features

The guide MUST include stub sections for features that are planned but not yet
implemented, so the structure is ready for the developer who ships each feature.

#### Scenario: Feature not yet implemented

WHEN a guide section covers a feature not yet shipped
THEN the section MUST contain a visible callout stating the section is forthcoming:
  `> ⚠️ **Coming in a future release.**`
AND the section MUST contain an HTML comment in the form `<!-- TODO: IGDD-XXXX -->`
  referencing the Jira ticket for the unimplemented feature

#### Scenario: Developer ships a stubbed feature

WHEN a developer implements the feature referenced by a stub's TODO comment
THEN their PR MUST replace the stub callout with full guide content
AND MUST remove the `<!-- TODO: IGDD-XXXX -->` comment

#### Scenario: Completeness check

WHEN a developer or CI job runs `grep -r "TODO: IGDD" doc/`
THEN every remaining stub section is reported
AND the count gives a measure of guide completeness

---

### Requirement: Full-stack ownership — documentation updated with UI changes

Any PR that modifies a page's UI MUST update the corresponding `doc/` Markdown file
in the same PR.

#### Scenario: UI change without doc update

WHEN a PR modifies a page component in `src/pages/` or `src/components/`
THEN the PR description MUST include a checklist item confirming the corresponding
  `doc/` file was reviewed and updated if necessary
AND code reviewers MUST verify the `doc/` file was touched before approving

#### Scenario: New page added

WHEN a PR introduces a new page
THEN the PR MUST add the corresponding `doc/` section for that page
AND MUST wire up the `HelpPanel` component on the new page (see help-panel spec)
