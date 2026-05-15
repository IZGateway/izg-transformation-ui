# Contributing to the User Guide

← [Home](index.md)

This page explains how to update the user guide content and refresh the screenshots.

## Guide Structure

All guide content lives under `public/help/`:

```
public/help/
├── index.md                  # Table of contents
├── login.md
├── navigation.md
├── mappings/
│   ├── index.md
│   └── create-edit.md
├── solutions/
│   ├── index.md
│   ├── create-edit.md
│   ├── operations.md
│   └── preconditions.md
├── pipelines/
│   ├── index.md
│   ├── create-edit.md
│   └── preconditions.md
├── images/                   # Screenshots (committed to repo)
└── contributing.md           # This file
```

Markdown files use **relative paths** for images (e.g., `../images/foo.png`) so they
render correctly in GitHub and in editors. The HelpPanel component rewrites these paths
at runtime so they resolve correctly in the browser.

## Editing Content

1. Edit the relevant `.md` file in `public/help/`.
2. Preview by opening the file in GitHub or any Markdown-aware editor.
3. If you add a new page, add it to `public/help/index.md` and wire a `HelpButton` /
   `HelpPanel` to the relevant application page (see the "HelpPanel Wiring" section of
   `tasks.md`).

## Refreshing Screenshots

Screenshots are committed to `public/help/images/`. When the application UI changes,
re-run the capture script to update them.

### Prerequisites

- **Node.js** 18 or later
- **Playwright browsers** installed:

  ```bash
  npx playwright install chromium
  ```

- A running Xform Console instance (test environment is recommended)

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `XFORM_BASE_URL` | Yes | Base URL of the running Xform Console (e.g., `https://xform-test.example.com`) |
| `XFORM_USERNAME` | Yes | Okta username for an account with access to all sections |
| `XFORM_PASSWORD` | Yes | Okta password |

### Running the Capture Script

```bash
XFORM_BASE_URL=https://xform-test.example.com \
XFORM_USERNAME=your@email.com \
XFORM_PASSWORD=yourpassword \
npm run capture-screenshots
```

On Windows (cmd):

```cmd
set XFORM_BASE_URL=https://xform-test.example.com
set XFORM_USERNAME=your@email.com
set XFORM_PASSWORD=yourpassword
npm run capture-screenshots
```

The script writes all screenshots to `public/help/images/`. After running, review the
images and commit them:

```bash
git add public/help/images/
git commit -m "docs: refresh user guide screenshots"
```

### What Gets Captured

The script captures screenshots of:

- Login page
- Navigation shell and sidebar
- Mappings list, mapping edit form, add mapping form
- Solutions list, solution info/operations form, add solution form
- Pipelines list, pipeline edit form (info and endpoints), add pipeline form

### Troubleshooting

| Problem | Solution |
|---|---|
| Script exits with "XFORM_BASE_URL is required" | Set the `XFORM_BASE_URL` env var |
| Login fails (Okta selector not found) | Okta tenant may use a different page layout; update the selectors in `scripts/capture-screenshots.js` |
| Screenshots show a loading spinner | Increase the `waitForLoadState` timeout or add an explicit `page.waitForSelector` for a stable element |
| Images are all blank / white | Headless rendering issue; try `headless: false` in the script to debug visually |
