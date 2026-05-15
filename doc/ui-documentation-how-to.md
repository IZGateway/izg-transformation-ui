# UI Documentation — How To

Quick reference for adding or updating Xform Console user guide content using Copilot.
For background and rationale see [ui-documentation-process.md](ui-documentation-process.md).

---

## Checklist

- [ ] Ticket history checked for prior architectural decisions
- [ ] Codebase inventoried — every route in `src/pages/` accounted for
- [ ] Features classified: implemented / stub / not-started
- [ ] OpenSpec CR created with proposal → specs → design → tasks
- [ ] Content files written under `public/help/`
- [ ] `HelpButton` wired on each new page
- [ ] Screenshots captured and hash-checked (no duplicates)
- [ ] Image paths verified in browser
- [ ] PR open, ticket moved to Ready for Code Review, screenshots attached to ticket

---

## Phase 1 — Preparation (Copilot-driven)

Start a Copilot session with the ticket number and let Copilot do the research before
any writing begins.

**Prompt to start:**
> "I have ticket IGDD-XXXX to document [feature/area]. Before we write anything,
> check the ticket history for any closed or Won't Do tickets that constrain the
> approach, then inventory the codebase to list every implemented route and compare
> it against what has a Jira ticket."

Copilot will:
1. Search Jira for related closed/Won't Do tickets (architectural decisions live there)
2. Read `src/pages/` and `src/components/Navigation/menuItems.tsx`
3. Produce a table: feature | in code | has ticket | status (implemented / stub / not-started)

**Review the table carefully.** The biggest features are often the ones with no
ticket — built as initial scaffold before ticket-per-feature was adopted. Decide with
Copilot which features get real content and which get a stub callout.

---

## Phase 2 — OpenSpec CR

**Prompt:**
> "Create an OpenSpec CR called `xform-console-<feature>`. Write the proposal first —
> show it to me before going further."

Work through the artifacts in order. Do not skip ahead to tasks or code:

1. **Proposal** — who needs it, what they need, why. Review before proceeding.
2. **Specs** — one spec file per capability (content structure, in-app wiring,
   screenshots, stub pages, contributing guide). Review each spec.
3. **Design** — technical decisions (folder layout, HelpPanel wiring, screenshot
   approach, image path convention).
4. **Tasks** — implementation checklist derived from specs and design.

**Prompt after each artifact:**
> "Show me what you wrote."

---

## Phase 3 — Content Files

**Prompt:**
> "Implement the content files per the tasks. Start with `public/help/index.md` and
> the feature overview pages. Show me each file before moving to the next."

### Folder layout

```
public/help/
├── index.md                  # Table of contents / home page
├── login.md
├── navigation.md
├── images/                   # Screenshots (committed to the repo)
├── <feature>/
│   ├── index.md              # Feature overview
│   └── create-edit.md        # Task-focused detail page
└── contributing.md
```

One `.md` file per distinct user task. A user looking for "how do I add an endpoint?"
should land on a short focused page, not scroll a megadoc.

### Image path convention

| File depth | Image reference |
|---|---|
| `public/help/login.md` (top level) | `images/login.png` |
| `public/help/pipelines/create-edit.md` (subdirectory) | `../images/pipeline-info.png` |

### Stub for unimplemented features

```markdown
> **Coming in a future release.**
> This feature is planned but not yet available. See IGDD-XXXX for status.
```

---

## Phase 4 — In-App Help Wiring

**Prompt:**
> "Wire HelpPanel to each implemented page using the tasks list."

```tsx
import HelpButton from '@/components/HelpButton'

<HelpButton docPath="pipelines/index" title="Pipelines Help" />
```

`docPath` = path under `public/help/`, no `.md` extension.
Place in the page's `AppHeaderBar` or title row — consistent position on every page.

---

## Phase 5 — Screenshots

**Prompt:**
> "Add screenshot steps to the capture script for every new page, then run it so I
> can log in."

```bash
npm run capture-screenshots
```

A browser opens. Sign in with Okta (MFA supported). The script waits up to 2 minutes
for the `/manage` redirect then captures automatically.

**After every run — prompt Copilot:**
> "Hash-check the screenshots for duplicates."

```powershell
cd public/help/images
Get-FileHash *.png | Sort-Object Hash | Format-Table Hash, Path
```

All hashes must be unique. Duplicates mean the script captured the same visual state
twice — Copilot will diagnose and fix the script, then ask you to log in again.

**Commit when clean:**

```bash
git add public/help/images/
git commit -m "docs: refresh user guide screenshots"
```

### Known pitfall: two-column layouts

Solution edit and Pipeline edit render two panels side by side. `page.screenshot()`
captures both at once, producing identical images. Copilot will fix this with a locator
clip — `data-testid="settings-container"` is on the left panel of both pages.

### Known pitfall: drawer state

The nav drawer defaults to collapsed. Two screenshots at the same URL in collapsed
state look identical. Click the toggle (`aria-label="toggle navigation drawer"`)
before the navigation-shell screenshot to expand it.

### Known pitfall: slow renders

Pages with async data keep rendering after `networkidle`. Add
`await page.waitForTimeout(2000)` after `waitForNetworkIdle` on solution edit,
pipeline edit, and mapping edit.

---

## Phase 6 — Review and Submit

**Prompt:**
> "Open the help markdown files in a browser so I can review them."

Check each file visually: images should load, links should work, content should be
accurate. Flag anything to Copilot for correction.

**Prompt when satisfied:**
> "Commit everything, open a PR, move the ticket to Ready for Code Review, unassign
> it, and attach the screenshot images to the ticket."

Copilot will:
1. Commit and push the branch
2. Open a PR against `develop`
3. Transition the Jira ticket to Ready for Code Review and clear the assignee
4. Copy the screenshots to `C:\temp` and attach them to the ticket via the Atlassian MCP

---

## Adding a New Feature Later

**Prompt:**
> "IGDD-XXXX ships [feature]. Add documentation for it — stub file exists at
> `public/help/<feature>/index.md`, replace it with real content and add a screenshot."

Steps Copilot will handle:
1. Replace stub with real content in `public/help/<feature>/`
2. Update `public/help/index.md`
3. Add `<HelpButton>` to the new page
4. Add screenshot step to `e2e/tests/capture-screenshots.spec.ts`
5. Run capture script (you log in), hash-check, commit

Documentation ships with the feature. It is part of the Definition of Done.
