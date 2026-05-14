# Spec: HelpPanel Component

## ADDED Requirements

### Requirement: HelpPanel component

A `HelpPanel` component MUST be implemented as a MUI `<Drawer>` that renders a
Markdown file from `doc/` as formatted help content when opened.

#### Scenario: User opens help on a page

WHEN a user clicks the Help button on any Xform Console page
THEN a drawer panel opens from the right side of the screen
AND the panel renders the guide section corresponding to that page
AND the content is formatted as GitHub Flavored Markdown (tables, code blocks,
  headings, and links are rendered correctly)

#### Scenario: User closes the panel

WHEN the user clicks the close button in the drawer header or clicks outside the drawer
THEN the panel closes
AND the page state is unchanged (no navigation occurred)

#### Scenario: Panel header

WHEN the HelpPanel is open
THEN the drawer header MUST display a title describing the current section
  (e.g., "Pipelines Help", "Mappings Help")
AND the header MUST contain a close button

---

### Requirement: Markdown content delivery

Guide Markdown files MUST be served as static assets so the `HelpPanel` can fetch
them at runtime without a full-page navigation.

#### Scenario: HelpPanel fetches its content

WHEN the HelpPanel component mounts with a given `docPath` prop (e.g., `"pipelines/index"`)
THEN it MUST fetch `/help/${docPath}.md` from the running Next.js application
AND render the response body as Markdown

#### Scenario: Build-time availability of doc files

WHEN the application is built
THEN all files under `doc/` MUST be available under the `public/help/` path
  (via symlink or a build-time copy step configured in `next.config.js`)
AND the relative folder structure under `doc/` MUST be preserved under `public/help/`

---

### Requirement: HelpButton component

A reusable `HelpButton` component MUST be provided as the standard trigger for opening
the `HelpPanel` on any page.

#### Scenario: HelpButton appearance

WHEN a page renders its header or toolbar
THEN the HelpButton MUST appear as a MUI `<IconButton>` using the `HelpOutline` icon
AND MUST be visually consistent with other icon actions in the page header

#### Scenario: HelpButton accessibility

WHEN a screen reader user encounters the HelpButton
THEN it MUST have an accessible label (e.g., `aria-label="Help"`)

---

### Requirement: Per-page wiring

Every page in the Xform Console MUST include a `HelpButton` wired to a `HelpPanel`
showing the guide section relevant to that page.

#### Scenario: Page with a corresponding guide section

WHEN a page has a corresponding Markdown file in `doc/`
THEN the page MUST render a `HelpButton` in the page header or toolbar area
AND clicking it MUST open the `HelpPanel` showing the content of that Markdown file

#### Scenario: Page with a stub guide section

WHEN a page's corresponding guide section is a stub (content not yet written)
THEN the `HelpPanel` MUST still open
AND MUST display the stub callout content indicating the section is forthcoming

---

### Requirement: react-markdown dependency

`react-markdown` with the `remark-gfm` plugin MUST be added as a production dependency
to support rendering GitHub Flavored Markdown in the `HelpPanel`.

#### Scenario: GFM content renders correctly

WHEN the HelpPanel renders a guide section containing GFM features
THEN Markdown tables MUST render as HTML tables
AND fenced code blocks MUST render with monospace formatting
AND relative image references (e.g., `![alt](../images/pipeline-list.png)`) MUST
  resolve correctly within the panel

#### Scenario: Next.js ESM compatibility

WHEN `react-markdown` is added to `package.json`
THEN any required `transpilePackages` configuration MUST be added to `next.config.js`
  to ensure the ESM-only package is compatible with the current Webpack build
