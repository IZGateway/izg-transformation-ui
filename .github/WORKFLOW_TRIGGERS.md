# Workflow Trigger Configuration - Quick Reference

## Problem Solved
Prevent automated dependency update PRs and unrelated workflow changes from triggering builds, while still allowing workflow files to be tested when modified.

## Solution
Use negated path patterns in `paths-ignore` to exclude all workflow files except the workflow itself:

```yaml
on:
  push:
    branches:
      - 'release/**'
    paths-ignore:
      - '.github/workflows/*'           # Ignore all workflow files
      - '!.github/workflows/deploy.yml' # EXCEPT this workflow itself
  pull_request:
    branches:
      - develop
    paths-ignore:
      - '.github/workflows/*'
      - '!.github/workflows/deploy.yml'
  workflow_dispatch:
```

## How It Works

### Pattern Explanation
- `.github/workflows/*` - Match all files in the workflows directory (single level, no subdirectories)
- `!.github/workflows/deploy.yml` - Negation pattern that creates an exception

### Trigger Behavior

| Change Made | deploy.yml Triggered? | Reason |
|-------------|----------------------|---------|
| Modify `deploy.yml` | ✅ YES | Exception pattern allows it |
| Modify `security-updates.yml` | ❌ NO | Ignored by first pattern |
| Modify `gitleaks.yml` | ❌ NO | Ignored by first pattern |
| Modify `src/app.js` | ✅ YES | Not in `.github/workflows/` |
| Security update PR touching only workflows | ❌ NO | All changes are ignored |

## Key GitHub Actions Behavior

**Important:** When a push or PR event occurs, GitHub Actions uses the workflow file **from the branch where the event occurred**, NOT the default branch.

This means:
- You can test workflow changes by pushing them to a branch
- The modified workflow will run with your changes
- You need to allow the workflow to trigger on changes to itself for testing

## Applied To izg-transformation-ui

### Current Workflows

- ✅ `.github/workflows/deploy.yml`
- ✅ `.github/workflows/security-updates.yml`
- ✅ `.github/workflows/create-image.yml`
- ✅ `.github/workflows/create-release-branch.yml`
- ✅ `.github/workflows/gitleaks.yml`

## Release-time Inspector2 Vulnerability Scan

Every real release (both `release.yml` and `hotfix.yml`, via the shared
`_release_common.yml`) generates an AWS Inspector2 vulnerability scan report for the
image it just pushed to the dev-account ECR repo `izg-transformation-ui`. Two jobs run
after the release job:

- `wait-for-inspector2-scan` — waits (up to ~20 min, exiting early) for Inspector2 to
  finish scanning `izg-transformation-ui:<version>`, since Inspector2 scans asynchronously.
- `scan-report` — calls the reusable workflow
  `IZGateway/izg-dependency-scripts/.github/workflows/ecr-scan-report.yml@v1` to produce a
  CDC-named JSON/CSV/HTML report (`YYYYMMDD_izgw-transf-ui_v<version>_InspectorScan.*`),
  uploaded as a GitHub Actions artifact.

The scan is **advisory**: it never blocks or fails a release, and it is **skipped on
dry-run** (no image is pushed). A green release does not guarantee a populated report —
download and inspect the artifact (an empty report usually means a tag/credential mismatch).

### CI prerequisites (admin-owned — see IGDD-2151)

These are environmental and are NOT created by the workflow code:

- **`AWS_ROLE_ARN` repository variable** — the OIDC role the scan jobs assume
  (`gh variable set AWS_ROLE_ARN --body "arn:aws:iam::<acct>:role/<role>"`). Read via
  `vars.AWS_ROLE_ARN`, not a secret.
- **GitHub OIDC IAM role** in the dev AWS account, trust policy scoped to this repo's
  release workflows, with IAM permissions **`inspector2:ListFindings`** *and*
  **`inspector2:ListCoverage`**.
- **Cross-repo workflow access** — `izg-dependency-scripts` must allow this repo to call
  its reusable workflow.

The release jobs that build/push images keep using the existing
`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` secrets; OIDC is used only by the scan jobs.

## Benefits

1. **Prevents Infinite Loops** - Automated workflows creating PRs don't trigger endless builds
2. **Testable Workflows** - Can test workflow changes by pushing to a branch
3. **Reduces CI Load** - Unrelated workflow changes don't trigger builds
4. **Clear Intent** - Only code changes (and the workflow itself) trigger deployments

## Testing Workflow Changes

### Option 1: Push to Branch (Recommended)
Push your workflow changes to a feature branch and verify the workflow runs with your changes.

**Important for `security-updates.yml`:**
- The workflow uses the branch that triggers it (no hardcoded `ref`)
- This means when you manually trigger from a feature branch, it will use your updated workflow
- The dependency scripts come from the `@izgateway/dependency-scripts` npm package
- Test your workflow changes by:
  1. Push your changes to a feature branch
  2. Go to Actions → Security Updates → Run workflow
  3. Select your feature branch from the dropdown
  4. The workflow will use the configuration from your branch

### Option 2: Manual Trigger
Use `workflow_dispatch` from the GitHub Actions UI to manually trigger the workflow.
- For scheduled workflows, select the branch you want to test from the branch dropdown
- The workflow will checkout and use code from that branch

### Option 3: Create PR
Create a PR with your workflow changes to see if it triggers correctly on the PR event.

## Security Updates Workflow

### Triggers
- **Schedule:** Daily at 3:15 AM UTC (`cron: '15 3 * * *'`)
- **Manual:** `workflow_dispatch` from Actions UI

### What It Does
1. Checks out repository
2. Installs dependencies and `@izgateway/dependency-scripts` globally
3. Runs `npm-check-updates --target minor`
4. Updates existing overrides with `update-overrides` (from `@izgateway/dependency-scripts`)
5. Fixes all vulnerabilities with `fix-vulnerabilities` (from `@izgateway/dependency-scripts`)
6. Tests override removal with `test-overrides` (from `@izgateway/dependency-scripts`)
7. Creates PR if changes detected

### Path Filtering
The security-updates workflow does not use path filtering because:
- It's scheduled (not triggered by pushes)
- It creates PRs rather than running on existing PRs
- Manual triggers are for testing purposes

## Troubleshooting

### Workflow not triggering when expected
- Check if all changes are in `.github/workflows/` directory
- Verify the exception pattern matches your workflow filename exactly
- Check branch name matches the pattern in the workflow

### Workflow triggering when it shouldn't  
- Ensure you're using `.github/workflows/*` (single asterisk) not `/**` (double asterisk)
- Verify the exception pattern is for the workflow file itself only
- Check if there are other trigger conditions (schedule, workflow_dispatch, etc.)

### Security updates not creating PRs
- Check the workflow run logs in Actions tab
- Verify `@izgateway/dependency-scripts` installed successfully (requires `packages: read` permission and GitHub npm registry access)
- Ensure GITHUB_TOKEN has write permissions
- Check if there are actually updates available

## Common Scenarios

### Scenario 1: Testing Workflow Changes
```bash
# 1. Create feature branch
git checkout -b feature/update-security-workflow

# 2. Modify the workflow file
vim .github/workflows/security-updates.yml

# 3. Push to GitHub
git add .github/workflows/security-updates.yml
git commit -m "feat: improve security updates workflow"
git push origin feature/update-security-workflow

# 4. Manually trigger workflow
# Go to Actions → Security Updates → Run workflow
# Select: feature/update-security-workflow
# Click: Run workflow
```

> **Note:** The dependency scripts are maintained in the
> [`@izgateway/dependency-scripts`](https://github.com/IZGateway/dependency-scripts)
> package. To update script behavior, publish a new version of that package.

### Scenario 2: Emergency Security Update
```bash
# Manually trigger security-updates workflow
gh workflow run security-updates.yml

# Or via GitHub UI
# Actions → Security Updates → Run workflow → Run workflow
```

### Scenario 3: Before Release
```bash
# 1. Trigger security updates
gh workflow run security-updates.yml

# 2. Wait for PR (if created)
gh pr list --label dependencies

# 3. Review and merge PR
gh pr view <PR-NUMBER>
gh pr merge <PR-NUMBER>

# 4. Proceed with release
```

## References
- [GitHub Actions: Workflow Syntax - on.<push|pull_request>.paths](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore)
- [GitHub Actions: Filter Pattern Cheat Sheet](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet)
- [NPM Dependency Strategy](./NPM_DEPENDENCY_STRATEGY.md)
- [Workflow Schedule](./WORKFLOW_SCHEDULE.md)

---

**Last Updated:** March 11, 2026
