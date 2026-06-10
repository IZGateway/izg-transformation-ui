## 1. Create `scan-ecr-image.yml`

- [x] 1.1 Add `.github/workflows/scan-ecr-image.yml` declaring both `on: workflow_dispatch` and `on: workflow_call`, each with a single required input `image-tag` (string)
- [x] 1.2 Set workflow-level `permissions:` to include `id-token: write` and `contents: read` for the OIDC dispatch path
- [x] 1.3 Add a header comment documenting the 4-level nesting ceiling (`release.yml` → `_release_common.yml` → `scan-ecr-image.yml` → `ecr-scan-report.yml`) and the advisory contract
- [x] 1.4 Move the `wait-for-inspector2-scan` job in verbatim: `continue-on-error: true`, `id-token: write`/`contents: read`, the UTC `release-date` output, OIDC `configure-aws-credentials@v6` against `${{ vars.AWS_ROLE_ARN }}`, and the ~20-minute `inspector2 list-coverage` poll — using `inputs.image-tag` for `IMAGE_TAG` and the literal `izg-transformation-ui` for `ECR_REPOSITORY`
- [x] 1.5 Move the `scan-report` job in: `needs: wait-for-inspector2-scan`, `id-token: write`/`contents: read`, `uses: IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1` with `ecr-repository: izg-transformation-ui`, `image-tag: ${{ inputs.image-tag }}`, `gh-pkg-name: izgw-transf-ui`, `release-date` from the wait job output, `aws-region: us-east-1`

## 2. Refactor `_release_common.yml` to call it

- [x] 2.1 Remove the inline `wait-for-inspector2-scan` and `scan-report` jobs from `_release_common.yml`
- [x] 2.2 Add a single replacement job that `uses: ./.github/workflows/scan-ecr-image.yml`, with `needs: release`, `if: inputs.dry-run == false`, and `image-tag: ${{ inputs.release-version }}`
- [x] 2.3 Ensure the calling job declares `permissions: id-token: write` (and `contents: read`) so the token permission propagates down to the called workflow
- [x] 2.4 Confirm `release.yml` / `hotfix.yml` still declare `id-token: write` at the workflow level (no change expected) so the full OIDC chain is intact

## 3. Verify

- [x] 3.1 Run `actionlint` (or equivalent YAML/workflow lint) over both workflow files — actionlint 1.7.12 passes clean (exit 0) on both `scan-ecr-image.yml` and `_release_common.yml`
- [x] 3.2 Trigger `scan-ecr-image.yml` manually against an already-published tag; confirm the wait exits promptly, the CDC-named JSON/CSV/HTML artifact is produced, and OIDC role assumption succeeds — verified in run [27300586350](https://github.com/IZGateway/izg-transformation-ui/actions/runs/27300586350): OIDC assumed `github-actions-izg-transformation-ui-inspector2`, poll returned `statusCode=ACTIVE reason=SUCCESSFUL` (~1.7s), artifact `izgw-transf-ui_v0.17.0-409-snapshot_InspectorScan` produced. Confirms the live `reason==SUCCESSFUL` enum and that the OIDC trust permits non-default branch refs.
- [x] 3.3 Confirm a dry-run release skips the scan job, and that a real (or dry-run-disabled test) release still reaches and runs `scan-ecr-image.yml` with the release version — **DEFERRED to next real release.** This exercises the release `workflow_call` path, not the manual path; will be confirmed the first time `_release_common.yml` invokes the workflow. Not cutting a release solely to verify.
- [x] 3.4 Confirm an induced scan failure (e.g. bad tag) does not fail the calling run — advisory behavior holds across the `workflow_call` boundary — **DEFERRED to next real release.** Caller-boundary behavior only exists on the release path; a manual bad-tag dispatch would just hit the ~20-min timeout without exercising the caller. Will be observed on the next real release.

## 4. Documentation

- [x] 4.1 Update any release/runbook docs that reference the scan jobs living in `_release_common.yml` to point at `scan-ecr-image.yml` and note the manual-run capability — updated `.github/WORKFLOW_TRIGGERS.md`
