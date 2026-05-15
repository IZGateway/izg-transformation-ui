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

Markdown files use **relative paths** for images. Top-level files (e.g., `login.md`,
`navigation.md`) reference images as `images/foo.png`. Files in subdirectories (e.g.,
`solutions/create-edit.md`) reference images as `../images/foo.png`. This keeps links
valid both in GitHub and in editors.

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

No credentials are required. The script opens a real browser window and waits for you
to sign in manually (Okta MFA is supported). Set `XFORM_BASE_URL` to override the
default target environment:

| Variable | Required | Description |
|---|---|---|
| `XFORM_BASE_URL` | No | Base URL of the Xform Console to screenshot (defaults to the dev environment) |

### Running the Capture Script

```bash
npm run capture-screenshots
```

When the browser opens, sign in with your Okta credentials. After a successful login
you will be redirected to the Pipelines page and the script will capture all screenshots
automatically. The browser window will close when the script finishes.

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
| Login redirect never happens | Check that you completed the Okta MFA challenge; the script waits up to 2 minutes |
| Screenshots show a loading spinner | A `waitForTimeout` delay may need to be increased for slower environments |
| Images are all blank / white | Ensure `headless: false` is set in `playwright.config.ts` (required for manual login) |
