## Context

The advisory Inspector2 scan lives as two inline jobs in `_release_common.yml`:
`wait-for-inspector2-scan` (OIDC auth + a ~20-minute bounded poll of `inspector2 list-coverage`,
marked `continue-on-error: true`) and `scan-report` (a `uses:` call to
`IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1`). Both are gated
`if: inputs.dry-run == false` and run after the `release` job that builds and pushes the image.

Because the jobs are embedded in the release workflow, the only way to test them — or the upstream
report workflow — is to cut a release or temporarily hand-edit a workflow. We want to extract them
into a reusable workflow that can also be invoked manually against any image tag, with zero behavior
change on the release path. The team has already reached consensus on the shape; this document
records the decisions and the one non-obvious constraint (advisory behavior across a `uses:` boundary).

## Goals / Non-Goals

**Goals:**
- A single workflow file, `scan-ecr-image.yml`, that both `_release_common.yml` calls
  (`workflow_call`) and an operator can run manually (`workflow_dispatch`).
- Manual runs take one input — the `image-tag` to scan — and produce the same CDC-named report
  artifact as a release.
- On-release behavior (regular + hotfix, skipped on dry-run, advisory, report naming, OIDC) is
  byte-for-byte equivalent to today from the release's perspective.
- The release run is never failed or blocked by the scan — same risk profile as today.

**Non-Goals:**
- Making `ecr-repository` or `gh-pkg-name` operator-selectable. They stay as literals; this tool is
  scoped to this repo's image.
- Changing the upstream `ecr-scan-report.yml` reusable workflow.
- Changing the existing access-key AWS auth used by build/push, or the `AWS_ROLE_ARN` /
  Inspector2 IAM setup.
- Making manual runs fail loudly on a bad scan (see Decisions — we keep both paths advisory).

## Decisions

### 1. Dual-trigger reusable workflow (`workflow_dispatch` + `workflow_call`)
`scan-ecr-image.yml` declares both triggers and a single required input `image-tag`. The release
caller passes `image-tag: ${{ inputs.release-version }}`; an operator types a tag in the Actions UI.
`ecr-repository: izg-transformation-ui` and `gh-pkg-name: izgw-transf-ui` are literals in the file.
- *Alternative considered:* two separate files (one manual, one reusable) both calling the upstream
  report workflow. Rejected — it duplicates the wait/poll logic and the whole point is one shared
  definition.

### 2. `_release_common.yml` calls it as one `uses:` job, keeping the dry-run gate
The two inline jobs are removed from `_release_common.yml` and replaced by a single job
`uses: ./.github/workflows/scan-ecr-image.yml`, carrying `if: inputs.dry-run == false` and
`needs: release`. The new file therefore has **no concept of dry-run** — the caller simply doesn't
invoke it on a dry-run. `release.yml` / `hotfix.yml` are untouched and inherit the scan through
`_release_common.yml`.

### 3. Advisory behavior is moved *inside* the called workflow
A `uses:` job cannot carry `continue-on-error`, so the release caller cannot swallow a failure of
the called workflow. The advisory guarantee is therefore engineered *inside* `scan-ecr-image.yml`:
`wait-for-inspector2-scan` keeps `continue-on-error: true`, and `scan-report` continues to rely on
the upstream report workflow being internally advisory (it already is, and already runs un-guarded
as a `uses:` job today). This is the **same blast radius as today** — `scan-report` is already a
`uses:` job in `_release_common.yml` that can't be `continue-on-error`'d — so no new build-failure
risk is introduced; the jobs are merely relocated one nesting level deeper.

### 4. Identical (advisory) behavior on both paths
Manual runs use the same jobs, so a genuinely failed scan can surface green on a manual run too.
We accept this to keep one definition and zero divergence; an operator inspects the run logs /
artifact to judge a manual test. (We explicitly chose this over a "strict on manual, advisory on
call" split.)

### 5. `release-date` stays computed as current UTC inside the wait job
Both paths get today's UTC date, feeding the CDC report name. No new input.

## Risks / Trade-offs

- **Workflow nesting reaches GitHub's max of 4 levels** (`release.yml` → `_release_common.yml` →
  `scan-ecr-image.yml` → `ecr-scan-report.yml`). → Accepted; documented in the proposal and the
  workflow header so nobody inserts a 5th level. Any future intermediate workflow would break the
  release path.
- **Advisory-by-design can hide a real failure on manual test runs.** → Mitigation: the run logs
  and the uploaded report artifact are the source of truth for a manual test; the `::warning::`
  on timeout remains visible in the run summary.
- **OIDC token permissions are bounded by every caller in the chain.** With the added level,
  `id-token: write` must be granted in `scan-ecr-image.yml` (workflow-level, for the dispatch path)
  and continue to be granted by `release.yml`/`hotfix.yml` and `_release_common.yml` for the call
  path. → Mitigation: declare `id-token: write` on the new workflow and the calling job; verified by
  a real manual run as the acceptance check.
- **First real invocation validates the Inspector2 `scanStatus` enum** (`reason == "SUCCESSFUL"`).
  → The manual trigger is itself the mitigation: we can now confirm the enum on demand instead of
  waiting for a release.
