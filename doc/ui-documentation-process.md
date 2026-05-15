# UI Documentation Process Notes

> **Purpose:** These are working notes capturing the methodology being developed
> while writing the Xform Console user guide (IGDD-2517). When the guide is
> complete, these notes will be distilled into a reusable Copilot skill for
> documenting any UI project.
>
> Notes are appended chronologically as the process evolves.

---

## 2026-05-14 — Starting Point: What We Did First

### Context

We were asked to write a user guide for the Xform Console (`izg-transformation-ui`),
a Next.js admin UI with no existing documentation. The originating ticket (IGDD-2517)
was vague about the approach; it had been converted from a Spike to a Task.

### Step 1: Understand why no docs exist

Before writing anything, we looked at the history. A prior ticket (IGDD-1813) had
attempted to add an in-app docs page — it was closed Won't Do because the team decided
documentation should live in GitHub. This told us:
- The format is settled: GitHub Flavored Markdown in `doc/`
- The audience is Solutions Engineers and IZ Gateway administrators
- In-app help is explicitly out of scope

**Lesson:** Always check the ticket history and any related closed/Won't Do tickets
before starting. They contain architectural decisions that constrain your approach.

### Step 2: Deeply familiarize with the codebase before writing anything

Rather than starting the proposal immediately, we did a full codebase exploration:
- Read `package.json`, `README.md`, `CONFIGURATION.md`, `RELEASE_NOTES.md`
- Read all page files (`src/pages/`) to enumerate every implemented route
- Read key components: `PipelinesTable`, `SolutionsTable`, `MappingTable`,
  `Navigation/menuItems.tsx`, `AppHeader`, `CreatePipeline`, `CreateSolution`,
  `CreateMapping`, `EditPipeline`
- Read the auth setup (`NextAuth` + Okta) and context providers
- Reviewed CI/CD workflows

This revealed the tech stack, data model, navigation structure, and — critically —
which UI areas were implemented and which were only stubs.

**Lesson:** Do not begin writing a user guide from tickets alone. The code is the
ground truth for what actually exists. Tickets may describe features that aren't
implemented yet, or features may exist with no ticket at all.

### Step 3: Inventory existing Jira tickets for UI features

We ran a Jira query for tickets tagged `UI` in the `Transformation Console` component:

```
project = IGDD AND component = "Transformation Console" AND labels = UI ORDER BY created DESC
```

This returned 5 tickets:
- IGDD-2699: Group/Role Mapping management (Open — not implemented)
- IGDD-2698: Sender management (Open — not implemented)
- IGDD-2697: User management (Open — not implemented, stub page only)
- IGDD-2533: Mapping management (Resolved — fully implemented)
- IGDD-1913: Automated UI smoke test spike (Resolved — led to CC Playwright suite)

**Lesson:** A Jira ticket label search gives you the explicitly planned features.
But it will miss anything built without a discrete ticket — which is common for
core foundational features.

### Step 4: Cross-reference code vs. tickets to find undocumented features

We enumerated all pages in `src/pages/` and compared them against the ticket list.
The gap was significant:

| Feature | In Code? | Has Ticket? |
|---|---|---|
| Pipeline management (list, create, edit, enable/disable) | ✅ | ❌ |
| Solutions Creator (list, create, edit) | ✅ | ❌ |
| Preconditions (sub-feature of pipelines and solutions) | ✅ | ❌ |
| Operations (sub-feature of solutions) | ✅ | ❌ |
| Mapping management | ✅ | ✅ IGDD-2533 |
| Login / Okta auth flow | ✅ | ❌ |
| Error page / 404 page | ✅ | ❌ |
| Snackbar success notifications | ✅ | ❌ |
| User management | stub only | ✅ IGDD-2697 |
| Sender management | ❌ | ✅ IGDD-2698 |
| Group/Role Mapping | ❌ | ✅ IGDD-2699 |

**Lesson:** Always inventory every page/route in the codebase. The biggest features
are often the ones with no ticket — they were built as the initial scaffold before
the team adopted a ticket-per-feature practice.

**Lesson:** Distinguish between "stub" (route exists, no real UI) and "implemented"
(functional UI). Stubs get a "Coming in a future release" placeholder, not real content.

### Step 5: Decide on the approach for each feature area

For **ticket-sourced features** (IGDD-2533, etc.):
- User story comes from the ticket description
- Success/failure criteria come from the ticket's acceptance criteria
- We already know the intended behavior

For **code-only features** (Pipelines, Solutions, etc.):
- User story must be inferred from the code and UX
- Success/failure criteria must be derived from the API contract and component behavior
- This requires reading the components carefully, not just the page files

### Step 6: Rethink the screenshot strategy

Initial assumption: write text-only guide, screenshots are optional.

Revised (after discussion): Screenshots are the highest-value element of a UI guide.
Without them, users can't orient themselves visually.

Key insight: A **full Playwright regression test suite** (IGDD-2887) is a significant
multi-sprint effort. But a **Playwright screenshot capture script** — no assertions,
Chromium only, just navigation + `page.screenshot()` — is an afternoon of work and
produces the same documentation images.

Decision: The screenshot script is part of the IGDD-2517 CR scope. The full test
suite (IGDD-2887) is tracked separately and will build on this foundation.

**Lesson:** Separate "Playwright for regression testing" from "Playwright for
documentation screenshots." They share the same tool but are different in scope,
effort, and purpose. Don't let the size of one block you from the value of the other.

---

*Process notes continue below as work progresses...*
