# Spec: Screenshot Capture Script

## ADDED Requirements

### Requirement: Committed capture script
A Playwright-based screenshot capture script SHALL be committed to the repository
alongside the user guide so that screenshots can be regenerated after UI changes.

#### Scenario: Running the capture script
WHEN a developer runs the capture script against a running Xform Console instance
THEN all screenshots referenced in the user guide are written to `doc/images/`
AND each screenshot filename matches the reference used in the corresponding guide section
AND existing images in `doc/images/` are overwritten

#### Scenario: Screenshot naming convention
WHEN a screenshot is captured for a specific page and state
THEN the filename follows the pattern: `<capability>-<state>.png`
  (e.g., `pipeline-list-populated.png`, `pipeline-create-form-empty.png`,
   `mapping-list-snackbar.png`, `login-okta-page.png`)

### Requirement: Script scope and constraints
The capture script MUST be scoped to documentation only — it is not a regression test suite.

#### Scenario: No assertions in capture script
WHEN the capture script runs
THEN it captures screenshots without making any assertions about page content
AND it does not fail the run if optional UI elements are absent

#### Scenario: Chromium only
WHEN the capture script runs
THEN it uses Chromium only (not Firefox or WebKit)
AND the script requires a `XFORM_BASE_URL` environment variable pointing to a
running test environment instance

#### Scenario: Consistent example data
WHEN the capture script runs
THEN it uses the fictional end-to-end example scenario defined in design.md
AND all screenshots reflect that same scenario so the guide reads coherently

### Requirement: Script documentation
The user guide MUST include instructions for re-running the capture script.

#### Scenario: Developer re-runs screenshots after UI change
WHEN a developer needs to refresh screenshots after a UI update
THEN the guide's contributing section explains how to run the capture script
AND lists the prerequisites (Node.js, Playwright, running Xform Console instance)
