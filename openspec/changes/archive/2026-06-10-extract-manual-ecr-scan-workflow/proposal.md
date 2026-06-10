## Why

The advisory Inspector2 scan + report jobs live inline in `_release_common.yml`, so the
only way to exercise them — or to validate the upstream
`izg-dependency-scripts/ecr-scan-report.yml` reusable workflow — is to cut a real release
or wire up a throwaway workflow. We want a first-class, repeatable way to run the scan/report
against an arbitrary image tag on demand, while keeping the exact same behavior on release.

## What Changes

- Add a new GitHub Actions workflow `scan-ecr-image.yml` that declares **both**
  `on: workflow_dispatch` (manual) and `on: workflow_call` (reusable).
- The workflow takes a **single required input `image-tag`**; `ecr-repository`
  (`izg-transformation-ui`) and `gh-pkg-name` (`izgw-transf-ui`) remain literals inside the file.
- Move the two existing scan jobs (`wait-for-inspector2-scan` keeping the ~20-min wait, then
  `scan-report`) out of `_release_common.yml` and into `scan-ecr-image.yml`. `release-date`
  is still computed as the current UTC date inside the wait job.
- `_release_common.yml` no longer contains the inline scan jobs; instead it calls
  `scan-ecr-image.yml` as a single `uses:` job, still gated `if: inputs.dry-run == false` and
  passing `image-tag: ${{ inputs.release-version }}`.
- `release.yml` / `hotfix.yml` are unchanged — they continue to inherit the scan through
  `_release_common.yml`.
- The advisory contract is preserved end-to-end: a scan failure, timeout, or empty report
  never fails or blocks a release. Because a `uses:` job cannot carry `continue-on-error`,
  `scan-ecr-image.yml` is engineered to always conclude success (the wait job keeps
  `continue-on-error: true`; the report relies on the upstream workflow being internally
  advisory). This is the same risk profile as today, just relocated — no new build-failure risk.

## Capabilities

### New Capabilities
- `on-demand-vulnerability-scan`: A manually triggered (`workflow_dispatch`) run of the
  Inspector2 wait + CDC-named report against an operator-specified image tag in the dev-account
  ECR repository, producing the same report artifact as the release path without cutting a release.

### Modified Capabilities
- `release-vulnerability-scan`: The scan/report jobs no longer live inline in
  `_release_common.yml`; they are provided by the new reusable `scan-ecr-image.yml`, which
  `_release_common.yml` invokes as a called workflow. On-release behavior (regular + hotfix,
  skipped on dry-run, advisory, CDC-named artifact, OIDC prerequisites) is unchanged, but the
  requirements that pin the jobs' location and OIDC-permission propagation are updated to reflect
  the added workflow-nesting level.

## Impact

- **Workflows:** new `.github/workflows/scan-ecr-image.yml`; `_release_common.yml` refactored to
  call it. `release.yml` / `hotfix.yml` untouched.
- **Nesting depth:** the release path becomes `release.yml` → `_release_common.yml` →
  `scan-ecr-image.yml` → `ecr-scan-report.yml` = 4 connected workflow levels (GitHub's maximum;
  no further headroom).
- **AWS / OIDC:** no change to the existing `AWS_ROLE_ARN` variable, the assumed role's
  `inspector2:ListCoverage` / `inspector2:ListFindings` permissions, or the access-key-based
  auth used by build/push. The new workflow declares `id-token: write` for both trigger paths.
- **Specs:** updates `release-vulnerability-scan` and adds `on-demand-vulnerability-scan`.
