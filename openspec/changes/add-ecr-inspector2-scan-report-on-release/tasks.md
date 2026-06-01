## 1. External prerequisites (admin / IGDD-2151 — gates real-release validation)

- [ ] 1.1 Confirm `izg-dependency-scripts` allows reusable-workflow access from this repo (Settings → Actions → General → Access), so `uses: IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1` resolves
- [ ] 1.2 Confirm a GitHub OIDC IAM role exists in the dev AWS account with a trust policy scoped to this repo's release workflows (`release.yml` / `hotfix.yml` / `_release_common.yml`)
- [ ] 1.3 Confirm the role's IAM policy includes BOTH `inspector2:ListFindings` and `inspector2:ListCoverage`
- [ ] 1.4 Confirm the repository (or environment) variable `AWS_ROLE_ARN` is set to that role's ARN (`gh variable list`)

## 2. Add scan jobs to `_release_common.yml`

- [ ] 2.1 Add a `wait-for-inspector2-scan` job: `needs` the image-push job, `if: inputs.dry-run == false`, `continue-on-error: true`, permissions `id-token: write` + `contents: read`
- [ ] 2.2 In `wait-for-inspector2-scan`, assume the OIDC role via `aws-actions/configure-aws-credentials` with `role-to-assume: ${{ vars.AWS_ROLE_ARN }}` and `aws-region: us-east-1`
- [ ] 2.3 In `wait-for-inspector2-scan`, poll `aws inspector2 list-coverage` filtered by repo `izg-transformation-ui` and image tag `<VERSION>`, looping (~30s) until `scanStatus.statusCode` is terminal/complete or ~20 min elapses, then exit 0 regardless
- [ ] 2.4 Add a `scan-report` job: `uses: IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1`, `needs: [<image-push-job>, wait-for-inspector2-scan]`, `if: inputs.dry-run == false`, `continue-on-error: true`, permissions `id-token: write` + `contents: read`
- [ ] 2.5 Wire `scan-report` inputs: `ecr-repository: izg-transformation-ui`, `image-tag: <VERSION>`, `gh-pkg-name: izgw-transf-ui`, `release-date: <current UTC date>`, `aws-region: us-east-1`
- [ ] 2.6 Compute `release-date` as `date -u +%Y-%m-%d` (e.g. a small step output consumed by 2.5)
- [ ] 2.7 Verify the new jobs are NOT in the `needs` chain of any job that gates "release succeeded" (advisory, never blocks)

## 3. Propagate OIDC permission from the callers

- [ ] 3.1 In `release.yml`, add `permissions: { id-token: write, contents: read }` to the job that calls `_release_common.yml`
- [ ] 3.2 In `hotfix.yml`, add `permissions: { id-token: write, contents: read }` to the job that calls `_release_common.yml`
- [ ] 3.3 Confirm the existing access-key-based steps (image build/push, APHL push, deploy) are unchanged

## 4. Static validation

- [ ] 4.1 Lint/validate the workflow YAML (e.g. `actionlint` or GitHub's workflow parser) for all three edited files
- [ ] 4.2 Confirm reusable-workflow nesting depth stays within GitHub's 4-level limit (`release.yml → _release_common.yml → ecr-scan-report.yml` = 3)

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

- [ ] 7.1 Note the new release-time Inspector2 scan + its prerequisites in the relevant CI docs (`.github/WORKFLOW_TRIGGERS.md` or equivalent)
- [ ] 7.2 Record the `AWS_ROLE_ARN` variable and required Inspector2 IAM permissions where env/secret expectations are documented
