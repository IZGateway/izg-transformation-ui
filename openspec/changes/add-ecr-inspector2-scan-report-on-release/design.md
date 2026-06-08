## Context

Releases of Xform Console are cut through two `workflow_dispatch` entry points —
`release.yml` (regular, from `develop`) and `hotfix.yml` (from `hotfix/*`) — both of which
call the shared reusable workflow `_release_common.yml` (`workflow_call`). The release logic
in `_release_common.yml` builds the Docker image and pushes it to the dev-account ECR repo
`izg-transformation-ui` tagged with the plain semver `VERSION` (e.g. `0.16.0`) and `latest`
(`_release_common.yml:359-368`). There is no `-RELEASE-{run}` tag on release images; the
`-release`/`-snapshot` suffixes only exist on dev/PR builds in `deploy.yml`.

Today AWS access in CI uses **long-lived access keys** (`secrets.AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY`) — there is no OIDC provider/role and no `AWS_ROLE_ARN` variable.

The report tooling already exists in `IZGateway/izg-dependency-scripts` as the reusable
workflow `.github/workflows/ecr-scan-report.yml` (running `.github/scripts/ecr-scan-report.sh`
+ `inspector2-scan-report.jq`). It authenticates **only** via OIDC (`vars.AWS_ROLE_ARN`,
`id-token: write`), filters Inspector2 findings by exact ECR repo + exact image tag, and
uploads a CDC-named JSON/CSV/HTML artifact. It runs `continue-on-error: true`, so a
misconfiguration fails silently/green.

Confirmed by reading the upstream script: `VERSION="${TAG%%-RELEASE-*}"`
(`ecr-scan-report.sh:52`) passes a tag with no `-RELEASE-` through unchanged, and the
Inspector2 filter uses the **raw** `$TAG` (`ecr-scan-report.sh:68-74`) — so passing
`image-tag=0.16.0` works as-is with no upstream change.

See `proposal.md` for motivation and the full decision record.

## Goals / Non-Goals

**Goals:**
- Every release (regular **and** hotfix) automatically produces a CDC-named Inspector2 scan
  report (JSON+CSV+HTML) for the exact image just pushed to `izg-transformation-ui`.
- Wait for Inspector2's asynchronous scan to complete (bounded) before generating the report,
  so reports reflect real findings rather than an unscanned image.
- Keep the scan **advisory** — it must never fail or delay-block a release beyond the bounded
  wait, and it is skipped entirely on dry-run.
- Reuse the upstream report workflow rather than vendoring the script.

**Non-Goals:**
- Migrating the repo's existing AWS auth (deploy, release image push, APHL push) to OIDC. Those
  keep using access keys. OIDC is introduced **only** for the scan/poll jobs.
- Scanning the APHL partner-account image (`izgw-transf-ui-VERSION`). Out of scope — different
  account we don't control Inspector2 in.
- Creating the AWS OIDC role / IAM policy / `AWS_ROLE_ARN` variable. These are admin-owned
  external prerequisites (IGDD-2151); this change only consumes them.
- Scanning dev/PR/`develop` builds from `deploy.yml`. This is release-only.
- Persisting reports anywhere beyond the GitHub Actions artifact (no S3, no GH Release assets).

## Decisions

### D1 — Hook the scan as jobs inside `_release_common.yml` (both paths, one integration)
Because `release.yml` and `hotfix.yml` both delegate to `_release_common.yml`, adding the scan
there covers both release types with a single change and no duplication.
**Alternatives considered:**
- *Standalone `workflow_dispatch`* — simplest, sidesteps async timing, but relies on a human
  remembering to run it per release; defeats "automatic on every release."
- *`on: push: tags: 'v*'`* — automatic, but a second workflow decoupled from the release run,
  and still needs the same async-wait logic; more moving parts than reusing the release graph.

### D2 — Two jobs: a poll job, then the report job (`needs:`-chained)
The reusable workflow only *lists* existing findings — it does not wait for Inspector2. Since a
job that uses `uses:` cannot also run preceding steps, the wait must live in a **separate
preceding job**:
- `wait-for-inspector2-scan` — a normal job (runner steps) that assumes the OIDC role and polls
  AWS Inspector2 for the pushed image's scan status until complete or timeout.
- `scan-report` — `uses: IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1`,
  gated on `needs: [<image-push-job>, wait-for-inspector2-scan]`.

**Poll mechanism:** use `aws inspector2 list-coverage` filtered by `ecrRepositoryName == izg-transformation-ui`
and `ecrImageTags == <VERSION>`, inspecting the resource's `scanStatus.statusCode`. Treat a
coverage entry whose scan has completed (e.g. status no longer `IN_PROGRESS`/`PENDING_INITIAL_SCAN`)
as done. Loop with a sleep interval (~30s) up to a ~20-minute cap, then proceed regardless.
**Alternative considered:** ECR `describe-image-scan-findings` — but Inspector2 enhanced scanning
is the source of truth here and `list-coverage` exposes scan status directly; mixing the basic-scan
API would be misleading.

### D3 — OIDC, scoped to just these jobs; specced as an external prerequisite
The reusable workflow requires OIDC (`vars.AWS_ROLE_ARN` + `id-token: write`). Rather than a
broad auth migration (D-rejected below), we grant OIDC narrowly:
- `id-token: write` (+ `contents: read`) on the `wait-for-inspector2-scan` and `scan-report`
  jobs in `_release_common.yml`.
- Because a called workflow's token permissions are **bounded by the caller**, `release.yml`
  and `hotfix.yml` must also declare `permissions: { id-token: write, contents: read }` on the
  job that calls `_release_common.yml`.
- The poll job assumes the role via `aws-actions/configure-aws-credentials@v4+` with
  `role-to-assume: ${{ vars.AWS_ROLE_ARN }}`; the reusable workflow assumes it internally.

**Alternative considered & rejected:** migrate all CI AWS auth to OIDC. Large blast radius
(deploy, release push, APHL), unrelated to this change's goal, and risky to couple with a
compliance-reporting feature.

### D4 — Scan the plain `VERSION` tag in the dev account
Pass `image-tag: <VERSION>` (e.g. `0.16.0`), `ecr-repository: izg-transformation-ui`,
`aws-region: us-east-1`. Verified the upstream script handles a tag without `-RELEASE-`
(`ecr-scan-report.sh:52,68-74`). No new tag is added to the release pipeline.
**Alternative considered:** add a `izg-transformation-ui:VERSION-RELEASE-<run>` tag to match the
doc's nominal contract — unnecessary given the verified behavior, and it pollutes ECR with an
extra tag.

### D5 — Advisory and dry-run-skipped
- `continue-on-error: true` on both jobs, and they are **not** in the `needs:` chain of any job
  that gates "release succeeded" — so a scan failure/empty report leaves the release green.
- `if: inputs.dry-run == false` on both jobs — no image is pushed on dry-run, so scanning would
  be guaranteed-empty/misleading.

### D6 — Inputs the caller supplies to the reusable workflow
- `ecr-repository: izg-transformation-ui`
- `image-tag: <VERSION>` (the version computed/used by the release, e.g. `0.16.0`)
- `gh-pkg-name: izgw-transf-ui` (drives `YYYYMMDD_izgw-transf-ui_v<version>_InspectorScan.*`)
- `release-date:` computed at run time as `date -u +%Y-%m-%d`
- `aws-region: us-east-1` (explicit, though it is also the default)
- Pin: `@v1` (floating major).

### D7 — Nesting depth
`release.yml → _release_common.yml → ecr-scan-report.yml` is 3 levels of reusable-workflow
nesting, within GitHub's limit of 4. ✅

## Risks / Trade-offs

- **OIDC infra doesn't exist yet (hard blocker)** → Implementation lands the workflow code, but
  it is non-functional until an admin creates the OIDC role (trust scoped by the `sub` claim to
  this repo, `repo:IZGateway/izg-transformation-ui:*`), attaches IAM perms, and sets
  `vars.AWS_ROLE_ARN`. A gating verification task precedes any real release test. (IGDD-2151.)
- **Poll needs an extra IAM permission** → The role needs **both** `inspector2:ListFindings`
  (report) **and** `inspector2:ListCoverage` (poll). If `ListCoverage` is omitted, the poll job
  errors; being advisory, that would surface as a non-blocking job failure, not a release failure.
- **Silent-green on misconfiguration** → `continue-on-error` + Inspector2's "zero findings looks
  the same as wrong tag/creds". Mitigation: the verification task must download the artifact and
  confirm it's non-empty/well-formed on the first real release, not trust the green check.
- **Bounded wait still races Inspector2** → If a scan takes >20 min, the report runs against a
  partially/!scanned image and may under-report. Mitigation: advisory; re-run is cheap; 20-min cap
  chosen as a generous-but-bounded default. Trade-off: up to +20 min added to a release run only
  when scanning is slow (poll exits early otherwise).
- **Caller-permission coupling** → If `release.yml`/`hotfix.yml` forget `id-token: write`, the
  nested OIDC assume fails. Mitigation: call out explicitly in tasks; both callers must be edited
  together with `_release_common.yml`.
- **Cross-repo workflow access** → If `izg-dependency-scripts` doesn't permit access from this
  repo, the `uses:` reference is rejected at parse time. Mitigation: verification task with the
  repo owner.
- **Upstream `@v1` drift** → Floating major could introduce input changes. Trade-off accepted for
  auto-patching; if it bites, pin to an exact `@vX.Y.Z`.

## Migration Plan

1. **Prereqs (admin / IGDD-2151, blocking):** create OIDC role + trust policy scoped by the
   `sub` claim to this repo (`repo:IZGateway/izg-transformation-ui:*`); attach
   `inspector2:ListFindings` + `inspector2:ListCoverage`; set repo **variable** (not secret)
   `AWS_ROLE_ARN`; confirm `izg-dependency-scripts` allows workflow access.
2. Add the `wait-for-inspector2-scan` + `scan-report` jobs to `_release_common.yml`
   (advisory, dry-run-skipped, OIDC).
3. Add `permissions: { id-token: write, contents: read }` to the `_release_common`-calling jobs
   in `release.yml` and `hotfix.yml`.
4. **Validate with a dry-run** first (scan jobs skip) to confirm no syntax/permission regressions
   in the release path.
5. **Validate on a real release** (or a throwaway test release): confirm the artifact
   `izgw-transf-ui_v<version>_InspectorScan` exists and the HTML/CSV are non-empty/sane.
6. **Rollback:** revert the workflow edits. Because the scan is advisory and additive, removing
   the jobs has no effect on the existing release behavior; no data migration involved.

## Open Questions

- ~~**OIDC role specifics** (exact ARN, trust condition, repo- vs environment-scoped variable)~~
  **RESOLVED (2026-06-04):** role `github-actions-izg-transformation-ui-inspector2` in account
  `357442695278`; trust scoped by `sub` = `repo:IZGateway/izg-transformation-ui:*`
  (`job_workflow_ref` scoping does not evaluate true for GitHub OIDC in this account); repo-level
  **variable** `AWS_ROLE_ARN` (must be a variable, not a secret — `vars.` is read on both sides).
- **Exact Inspector2 `scanStatus` terminal values** to treat as "done" vs "still scanning" —
  to be pinned in `tasks.md`/implementation against the live API (`list-coverage` status enum).
- **Whether to also fail-fast (non-advisory) later** once OIDC/timing prove reliable — deferred;
  advisory for the initial rollout.
