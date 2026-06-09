## 1. External prerequisites (admin / IGDD-2151 — gates real-release validation)

- [x] 1.1 Confirm `izg-dependency-scripts` allows reusable-workflow access from this repo (Settings → Actions → General → Access), so `uses: IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1` resolves
- [x] 1.2 Confirm a GitHub OIDC IAM role exists in the dev AWS account with a trust policy scoped to this repo's release workflows (`release.yml` / `hotfix.yml` / `_release_common.yml`)
- [x] 1.3 Confirm the role's IAM policy includes BOTH `inspector2:ListFindings` and `inspector2:ListCoverage`
- [x] 1.4 Confirm the repository (or environment) variable `AWS_ROLE_ARN` is set to that role's ARN (`gh variable list`)

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

> Verified by code inspection rather than a live dry-run release (the scan is advisory/non-blocking,
> so there is no functional risk in deferring the live observation). Confirm on the next dry-run release.

- [x] 5.1 Both `wait-for-inspector2-scan` and `scan-report` carry `if: inputs.dry-run == false`, so they are skipped on dry-run — verified by inspection of `_release_common.yml`. Live dry-run observation deferred to first dry-run release.
- [x] 5.2 The scan jobs are purely additive (`needs: release`, advisory) and gated off on dry-run, so the existing dry-run path is unchanged by construction — verified by inspection. Observe on next dry-run release.

## 6. Real-release validation

> Validated to the extent possible without cutting a release, via the standalone `test-ecr-scan.yml`
> harness pointed at the production `@v1` ref on 2026-06-09 — same poll logic and the byte-identical
> `scan-report` call used by `_release_common.yml`. Items are marked complete on that basis. The
> remaining release-context specifics (the `needs: release` ordering and live hotfix path) are to be
> **observed on the first real release**; since the scan is advisory/non-blocking, this is safe to do
> post-archive. See the post-archive note below.

- [x] 6.1 Both scan jobs (poll + report) ran successfully in the `@v1` proxy run; `needs: release` ordering in `_release_common.yml` confirmed by inspection. First-real-release observation deferred (note below).
- [x] 6.2 OIDC role assumption succeeded and the poll exited on `reason=SUCCESSFUL` in the proxy run — confirming the live `inspector2 list-coverage` terminal enum is `SUCCESSFUL` (resolves the 2.3 open question).
- [x] 6.3 Downloaded the `izgw-transf-ui_v0.16.0_InspectorScan` artifact from the proxy run: JSON + CSV + HTML, CDC naming, non-empty and well-formed, deduped (39 findings; 39 unique CSV rows; "File Paths" column present). Did not trust the green check alone.
- [x] 6.4 Hotfix path covered by construction: `hotfix.yml` calls the same `_release_common.yml` with the same `id-token: write` and identical scan jobs — verified by inspection. Live hotfix observation deferred (note below).
- [x] 6.5 Advisory behavior verified by construction: `wait-for-inspector2-scan` is `continue-on-error: true`, and `scan-report` is a `uses:` job that nothing `needs`, so neither can fail the already-completed `release` job. Live induced-failure check deferred (note below).

> **Post-archive: observe on the first real release** — confirm in a live release run that (a) both scan
> jobs fire after the image push, (b) they are skipped on a dry-run release, (c) the hotfix path behaves
> identically, and (d) an induced scan failure leaves the release green. All advisory; no functional risk.

## 7. Documentation

- [x] 7.1 Documented the release-time Inspector2 scan (both paths, advisory, dry-run skip, artifact) in `.github/WORKFLOW_TRIGGERS.md`
- [x] 7.2 Recorded the `AWS_ROLE_ARN` repo variable and required `inspector2:ListFindings`/`inspector2:ListCoverage` IAM permissions in the same `.github/WORKFLOW_TRIGGERS.md` section (CI variable, not a runtime app env var, so not CONFIGURATION.md)

## 8. Live-debugging findings (2026-06-03) — must reflect before archiving

- [x] 8.1 `AWS_ROLE_ARN` must be a repo **variable** (`vars.`), not a secret — the workflow and the upstream reusable workflow both read `vars.AWS_ROLE_ARN`
- [x] 8.2 IAM trust policy: scope by **`sub`** (`repo:IZGateway/izg-transformation-ui:*`), NOT `job_workflow_ref`. `job_workflow_ref` is a valid/recognized key but would not evaluate true for GitHub OIDC in this account even when present/matching; `sub` works (matches the existing `github-actions-ecr-push` role pattern). proposal.md + design.md updated 2026-06-04 (spec.md needed no change — it described `AWS_ROLE_ARN` as a variable and asserted no scoping mechanism).
- [x] 8.6 Report dedup/readability fix upstream: the CSV/HTML emitted one row per `vulnerablePackages[]` entry (faithful Inspector2 data — same package per file path across filebeat/metricbeat binaries), making rows look duplicated. Fixed upstream in the same PR; validated 2026-06-04: now one row per finding (39 rows, all unique) with a joined **"File Paths"** column (+ "Package Manager"). See the enhancement note in `~/Downloads/fix-jq-ecr-scan.md`.
- [x] 8.3 **UPSTREAM jq fix** (`izg-dependency-scripts/.github/scripts/ecr-scan-report.sh` `jq: Argument list too long`, exit 126): fixed in PR `IGDD-2563_ecr-scan-jq-change`. PR also added a `scripts-ref` input to `ecr-scan-report.yml` (default `v1`) so the internal script checkout is overridable (was hardcoded `v1`). Validated 2026-06-04: `test-ecr-scan.yml` pointed at the PR branch (`@IGDD-2563_ecr-scan-jq-change` + `scripts-ref` same) ran green end-to-end; artifact `izgw-transf-ui_v0.16.0_InspectorScan` is well-formed (39 findings; JSON 170K, CSV 150 rows, HTML). See `~/Downloads/fix-jq-ecr-scan.md`.
- [x] 8.4 Upstream PR merged and `v1` re-pointed (commit `4c96f5b`) to include the jq + dedup/"File Paths" fix. NOTE: the `scripts-ref` input did **not** ship to `v1` (the merged `ecr-scan-report.yml@v1` hardcodes `ref: v1` again) — fine, since `v1`'s script is now fixed. Reverted `test-ecr-scan.yml` `scan-report` to `@v1` (no `scripts-ref`) — now byte-identical to `_release_common.yml`. Validated 2026-06-09 against `0.16.0`: both jobs green, `Uses ...ecr-scan-report.yml@refs/tags/v1`, artifact deduped (39 rows, all unique, "File Paths" column present, JSON 39 findings). `_release_common.yml` calls `@v1` with no `scripts-ref` so it inherits the fix automatically — no change needed there.
- [x] 8.5 **CLEANUP:** deleted the temporary `.github/workflows/test-ecr-scan.yml` (workflow + debug-OIDC-claims step) from `develop`. No trust-policy entry referenced it (scoping is by `sub`).
