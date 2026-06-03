## 1. External prerequisites (admin / IGDD-2151 — gates real-release validation)

- [ ] 1.1 Confirm `izg-dependency-scripts` allows reusable-workflow access from this repo (Settings → Actions → General → Access), so `uses: IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1` resolves
- [ ] 1.2 Confirm a GitHub OIDC IAM role exists in the dev AWS account with a trust policy scoped to this repo's release workflows (`release.yml` / `hotfix.yml` / `_release_common.yml`)
- [ ] 1.3 Confirm the role's IAM policy includes BOTH `inspector2:ListFindings` and `inspector2:ListCoverage`
- [ ] 1.4 Confirm the repository (or environment) variable `AWS_ROLE_ARN` is set to that role's ARN (`gh variable list`)

## 2. Add scan jobs to `_release_common.yml`

- [x] 2.1 Add a `wait-for-inspector2-scan` job: `if: inputs.dry-run == false`, `continue-on-error: true`, permissions `id-token: write` + `contents: read`. (Deviation: the release is a single monolithic `release` job — there is no separate image-push job — so the new jobs use `needs: release`.)
- [x] 2.2 In `wait-for-inspector2-scan`, assume the OIDC role via `aws-actions/configure-aws-credentials@v6` with `role-to-assume: ${{ vars.AWS_ROLE_ARN }}` and `aws-region: us-east-1`
- [x] 2.3 In `wait-for-inspector2-scan`, poll `aws inspector2 list-coverage` filtered by repo `izg-transformation-ui` and image tag `<VERSION>`, looping (~30s) until `scanStatus.reason == SUCCESSFUL` or ~20 min elapses, then exit 0 regardless. (Exact terminal enum value to be confirmed against the live API in 6.1-6.3.)
- [x] 2.4 Add a `scan-report` job: `uses: IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1`, `needs: [release, wait-for-inspector2-scan]`, `if: inputs.dry-run == false`, permissions `id-token: write` + `contents: read`. (Deviation: `continue-on-error` is NOT a supported key on a `uses:` job; advisory behavior comes from the upstream reusable workflow being internally `continue-on-error` plus the release job already having completed.)
- [x] 2.5 Wire `scan-report` inputs: `ecr-repository: izg-transformation-ui`, `image-tag: <VERSION>`, `gh-pkg-name: izgw-transf-ui`, `release-date: <current UTC date>`, `aws-region: us-east-1`
- [x] 2.6 Compute `release-date` as `date -u +%Y-%m-%d` (step output `release-date` on `wait-for-inspector2-scan`, consumed by 2.5)
- [x] 2.7 Verify the new jobs are NOT in the `needs` chain of any job that gates "release succeeded" (advisory, never blocks) — nothing `needs` them; they `needs: release`

## 3. Propagate OIDC permission from the callers

- [x] 3.1 In `release.yml`, added `id-token: write` to the workflow `permissions` block (alongside existing `contents: write`, `packages: write`, `pull-requests: read`)
- [x] 3.2 In `hotfix.yml`, added `id-token: write` to the workflow `permissions` block (same set)
- [x] 3.3 Confirmed the existing access-key-based steps in `_release_common.yml` (ECR/APHL logins, build/push) are unchanged

## 4. Static validation

- [x] 4.1 Validated all three workflow files parse as YAML (`python3 -c yaml.safe_load`); jobs resolve to `release`, `wait-for-inspector2-scan`, `scan-report`. (`actionlint` not installed locally — recommend running it in CI for full semantic linting.)
- [x] 4.2 Confirmed reusable-workflow nesting depth stays within GitHub's 4-level limit (`release.yml → _release_common.yml → ecr-scan-report.yml` = 3)

## 5. Dry-run validation

- [ ] 5.1 Run a release with dry-run enabled and confirm the `wait-for-inspector2-scan` and `scan-report` jobs are skipped
- [ ] 5.2 Confirm the dry-run release path otherwise behaves exactly as before (no regressions)

## 6. Real-release validation (after section 1 prerequisites are met)

- [ ] 6.1 Cut a regular (or throwaway) release and confirm both scan jobs run after the image push
- [ ] 6.2 Confirm OIDC role assumption succeeds and the poll exits when Inspector2 reports the scan complete
- [ ] 6.3 Download the `izgw-transf-ui_v<version>_InspectorScan` artifact and confirm it contains JSON + CSV + HTML with the CDC naming and is non-empty / well-formed (do not trust the green check alone)
- [ ] 6.4 Cut a hotfix (or simulate the hotfix path) and confirm the scan jobs run identically
- [ ] 6.5 Confirm an induced scan failure (e.g. temporarily wrong tag) leaves the release green (advisory behavior)

## 7. Documentation

- [x] 7.1 Documented the release-time Inspector2 scan (both paths, advisory, dry-run skip, artifact) in `.github/WORKFLOW_TRIGGERS.md`
- [x] 7.2 Recorded the `AWS_ROLE_ARN` repo variable and required `inspector2:ListFindings`/`inspector2:ListCoverage` IAM permissions in the same `.github/WORKFLOW_TRIGGERS.md` section (CI variable, not a runtime app env var, so not CONFIGURATION.md)

## 8. Live-debugging findings (2026-06-03) — must reflect before archiving

- [x] 8.1 `AWS_ROLE_ARN` must be a repo **variable** (`vars.`), not a secret — the workflow and the upstream reusable workflow both read `vars.AWS_ROLE_ARN`
- [x] 8.2 IAM trust policy: scope by **`sub`** (`repo:IZGateway/izg-transformation-ui:*`), NOT `job_workflow_ref`. `job_workflow_ref` is a valid/recognized key but would not evaluate true for GitHub OIDC in this account even when present/matching; `sub` works (matches the existing `github-actions-ecr-push` role pattern). Update proposal.md/design.md/spec.md which currently describe `job_workflow_ref`.
- [ ] 8.3 **UPSTREAM BLOCKER:** `izg-dependency-scripts/.github/scripts/ecr-scan-report.sh:94` fails `jq: Argument list too long` (exit 126) on images with many findings (0.16.0 reproduces). Fix in izg-dependency-scripts (pipe findings via stdin/file, not argv) and ensure the `@v1` ref gets it. See `~/Downloads/fix-jq-ecr-scan.md`.
- [ ] 8.4 After the upstream fix ships to `@v1`: re-run `test-ecr-scan.yml` against `0.16.0`, confirm full path green + real `izgw-transf-ui_v0.16.0_InspectorScan` artifact.
- [ ] 8.5 **CLEANUP:** delete the temporary `.github/workflows/test-ecr-scan.yml` (contains the workflow + the debug-OIDC-claims step) from `develop` once 8.4 passes. It's `workflow_dispatch`-only and safe to leave meanwhile; no trust-policy entry references it (we moved to `sub` scoping).
