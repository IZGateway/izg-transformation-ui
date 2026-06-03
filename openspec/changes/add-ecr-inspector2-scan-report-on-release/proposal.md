## Why

Releases of Xform Console ship a container image to ECR, but there is no automated,
auditable vulnerability report tied to each release. CDC compliance needs a per-release
AWS Inspector2 scan report (JSON + CSV + HTML, in the CDC file-naming convention) for the
exact image that was cut. Today this would be a manual step that is easy to skip. Both the
regular release path and the hotfix path flow through `_release_common.yml`, so hooking the
scan there covers every release with one integration.

The scan script and report generator already exist as a reusable workflow in
`IZGateway/izg-dependency-scripts` (`.github/workflows/ecr-scan-report.yml`). We do **not**
vendor that script; we call the reusable workflow and supply this repo's image coordinates.

## What Changes

- Add a **scan job to `_release_common.yml`** that runs on every release (regular and hotfix)
  after the image is pushed to the dev ECR repo `izg-transformation-ui`. The job calls
  `IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1` with:
  - `ecr-repository: izg-transformation-ui`
  - `image-tag: <VERSION>` (the plain release tag, e.g. `0.16.0` — the only release tag this
    repo pushes; there is **no** `-RELEASE-{run}` tag). **Verified supported:** the upstream
    `ecr-scan-report.sh` derives the version via `${TAG%%-RELEASE-*}`, which passes a tag with
    no `-RELEASE-` through unchanged (`VERSION=0.16.0`), and filters Inspector2 by the raw
    `image-tag` — so a plain semver tag works as-is with no upstream change.
  - `gh-pkg-name: izgw-transf-ui`
  - `release-date: <today, UTC>`
  - `aws-region: us-east-1`
- Add a **preceding poll step/job** that waits for AWS Inspector2 to finish scanning the
  pushed image (up to ~20 min, exiting early once complete) before the report runs, because
  Inspector2 scans asynchronously and the reusable workflow only *lists* existing findings.
- The scan is **advisory**: `continue-on-error`, never blocks or fails the release.
- The scan is **skipped on dry-run** (`inputs.dry-run == true`), since no image is pushed.
- Grant `id-token: write` (OIDC) on the relevant jobs in `_release_common.yml`, and pass that
  permission down from the callers `release.yml` and `hotfix.yml` (a called workflow's
  permissions are bounded by the caller's).
- Output: the reusable workflow's GitHub Actions artifact
  (`izgw-transf-ui_v<version>_InspectorScan`, JSON+CSV+HTML, 90-day retention). No other
  destination.
- **No change** to the repo's existing AWS auth for deploy/release/APHL logins — those keep
  using the current access-key secrets. OIDC is introduced **only** for the scan jobs.

## Capabilities

### New Capabilities
- `release-vulnerability-scan`: On cutting a regular or hotfix release, automatically generate
  and retain a CDC-named AWS Inspector2 scan report for the released ECR image. Covers the
  trigger point (nested in `_release_common.yml`, both paths), waiting for the asynchronous
  Inspector2 scan to complete, calling the reusable report workflow with this repo's image
  coordinates, advisory/non-blocking behavior, dry-run skip, and the OIDC prerequisites the
  scan depends on.

### Modified Capabilities
<!-- None. No existing spec in openspec/specs/ has requirements that change; the only existing
     spec is `uuid-override`, which is unrelated. -->

## Impact

- **Workflows (this repo):**
  - `.github/workflows/_release_common.yml` — new poll + scan jobs; `id-token: write` on those jobs.
  - `.github/workflows/release.yml` and `.github/workflows/hotfix.yml` — add `permissions:`
    (`id-token: write`, `contents: read`) so the OIDC token can be minted for the called workflow.
- **Cross-repo dependency:** `IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1`.
  Requires that repo to allow workflow access from this repo. (Plain-tag support is **confirmed** —
  see `image-tag` note above; the only remaining cross-repo item to verify is workflow access.)
- **AWS (dev account — same account the current `AWS_ACCESS_KEY_ID` targets):**
  - ECR repo `izg-transformation-ui` and Inspector2 findings live here.
  - **External prerequisites (admin-owned, blockers — IGDD-2151):**
    1. A GitHub OIDC IAM role whose trust policy is scoped to this repo's release workflows.
    2. Role IAM policy must include **`inspector2:ListFindings`** *and* **`inspector2:ListCoverage`**
       (the latter for the poll step).
    3. Repo (or environment) variable **`AWS_ROLE_ARN`** set to that role's ARN
       (the reusable workflow reads `vars.AWS_ROLE_ARN`).
  - Implementation is **blocked** until these exist; a verification task gates rollout.
- **Release-run duration:** worst case +~20 min only when Inspector2 scanning is slow (the poll
  exits early once the scan completes).
- **No application/runtime code changes.** CI/release only.
