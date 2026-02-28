# GitHub Actions Workflow Schedule Summary

This document provides an overview of all scheduled workflows to help avoid conflicts.

## Daily Schedule (UTC)

| Time | Workflow | Description | Days |
|------|----------|-------------|------|
| **03:15** | Security Updates | Updates dependencies to latest minor versions and adds security overrides | Daily |

## Workflow Details

### 03:15 UTC - Security Updates
- **File:** `.github/workflows/security-updates.yml`
- **Branch:** `develop`
- **Purpose:** Keep dependencies current with minor version updates and address security vulnerabilities
- **Frequency:** Daily
- **Duration:** ~5-10 minutes (includes build and tests)
- **Actions:**
  - Runs `npm-check-updates` with `--target minor`
  - Updates existing overrides to latest versions
  - Adds security overrides for vulnerable transitive dependencies
  - Tests if overrides can be removed
  - Creates PR if changes detected

## Conflict Avoidance

The schedule is designed to run at a quiet time:

1. **3:15 AM UTC** - Security updates run (quietest time, minimal conflict with other workflows)

**Benefits:**
- Runs during off-peak hours
- PRs are ready for review at start of business day
- No resource contention with other workflows
- Does not interfere with deployment workflows

## Manual Triggers

All workflows support manual triggering via `workflow_dispatch`, which can be initiated from the GitHub Actions UI regardless of schedule.

### When to Manually Trigger Security Updates

- **Before a release** - Ensure all dependencies are current
- **Critical CVE announced** - Immediate security response
- **After major dependency changes** - Verify security posture
- **Testing workflow changes** - Validate script modifications

## Recommendations

### If you need to add new scheduled workflows:

- **Avoid:** 03:15 UTC (security updates running)
- **Safe times:** 00:00-03:00 UTC, 04:00-23:00 UTC
- **Consider:** Weekend slots (Saturday/Sunday) for intensive tasks
- **Best practice:** Leave at least 1 hour gap between scheduled workflows

### If workflow durations increase:

Monitor the actual runtime of workflows. If a workflow takes longer than expected:

1. Check if it overlaps with other workflows or deployments
2. Adjust timing to maintain gaps
3. Consider running less frequently if needed
4. Optimize the workflow itself (caching, parallelization)

## Integration with Other Workflows

### Deploy Workflow
- **Triggered by:** Push to `release/**` branches, manual trigger
- **No conflict:** Runs on-demand, not scheduled
- **Note:** Deploy after reviewing and merging security PRs

### Create Release Branch
- **Triggered by:** Manual trigger only
- **No conflict:** On-demand workflow
- **Best practice:** Run security updates before creating release branch

### Gitleaks
- **Triggered by:** Push, pull request
- **No conflict:** Event-driven, not scheduled

## Monitoring

### Check Workflow Status
```bash
# Via GitHub CLI
gh workflow list
gh run list --workflow=security-updates.yml --limit 10
```

### View Recent Runs
- Navigate to: **Actions** → **Security Updates**
- Check for failures or warnings
- Review PRs created by the workflow

### Notifications
Configure GitHub notifications for:
- Workflow failures
- Pull requests with `dependencies` label
- Security alerts

## Resource Usage

### GitHub Actions Minutes

Estimated monthly usage for security updates:
- **Runs per month:** ~30 (daily)
- **Average duration:** ~8 minutes
- **Total:** ~240 minutes/month

This is well within the free tier for public repositories and minimal for private repositories.

## Maintenance

### Quarterly Review

Every quarter, review and update:
- Workflow schedules (adjust timing if needed)
- Script effectiveness (check PR merge rate)
- Resource usage (optimize if needed)
- Documentation accuracy

### Annual Review

Annually, review:
- Workflow automation effectiveness
- Security update patterns and trends
- Build times and optimization opportunities
- GitHub Actions plan limits

---

**Last Updated:** February 28, 2026
