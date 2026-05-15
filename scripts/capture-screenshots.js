#!/usr/bin/env node
/**
 * Playwright screenshot capture script for the Xform Console user guide.
 *
 * Prerequisites:
 *   - A running Xform Console instance accessible at XFORM_BASE_URL
 *   - Valid Okta credentials for XFORM_USERNAME / XFORM_PASSWORD
 *   - Playwright browsers installed: npx playwright install chromium
 *
 * Usage:
 *   XFORM_BASE_URL=https://xform.example.com \
 *   XFORM_USERNAME=user@example.com \
 *   XFORM_PASSWORD=secret \
 *   npm run capture-screenshots
 *
 * Output: screenshots written to public/help/images/
 */

const { chromium } = require('@playwright/test')
const path = require('path')

const BASE_URL = process.env.XFORM_BASE_URL
const USERNAME = process.env.XFORM_USERNAME
const PASSWORD = process.env.XFORM_PASSWORD
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'help', 'images')

if (!BASE_URL) {
  console.error('ERROR: XFORM_BASE_URL environment variable is required.')
  process.exit(1)
}
if (!USERNAME || !PASSWORD) {
  console.error(
    'ERROR: XFORM_USERNAME and XFORM_PASSWORD environment variables are required.'
  )
  process.exit(1)
}

/** Capture a full-page screenshot, logging the file name. */
async function shot(page, filename) {
  const file = path.join(OUT_DIR, filename)
  await page.screenshot({ path: file, fullPage: false })
  console.log(`  ✓ ${filename}`)
}

/** Wait for the main content area to be visible after navigation. */
async function waitForContent(page) {
  await page.waitForLoadState('networkidle')
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await context.newPage()

  // ── Login ────────────────────────────────────────────────────────────────
  console.log('Logging in…')
  await page.goto(BASE_URL)
  await waitForContent(page)

  // Okta sign-in form
  await page.fill('[name="identifier"], input[type="email"], #okta-signin-username', USERNAME)
  // Some Okta flows show password on the same page; others require "Next" first
  const nextBtn = page.locator('input[value="Next"], button:has-text("Next")').first()
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click()
    await waitForContent(page)
  }
  await page.fill(
    '[name="credentials.passcode"], input[type="password"], #okta-signin-password',
    PASSWORD
  )
  await page.click(
    'input[value="Sign in"], button[type="submit"]:has-text("Sign in"), #okta-signin-submit'
  )
  await waitForContent(page)

  // Capture login page before submit (go back to the login URL to screenshot it)
  console.log('\nCapturing screenshots…')
  await page.goto(BASE_URL + '/api/auth/signin')
  await waitForContent(page)
  await shot(page, 'login.png')

  // Re-authenticate to land on the app
  await page.goto(BASE_URL)
  await waitForContent(page)

  // ── Navigation shell ─────────────────────────────────────────────────────
  await page.goto(BASE_URL)
  await waitForContent(page)
  await shot(page, 'navigation-shell.png')

  // Sidebar close state (default) — just grab the sidebar portion
  await shot(page, 'navigation-sidebar.png')

  // ── Mappings list ────────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/mapping`)
  await waitForContent(page)
  await shot(page, 'mappings-list.png')

  // ── Mapping edit (first row) ──────────────────────────────────────────────
  const firstEditMapping = page.locator('[aria-label="edit"]').first()
  if (await firstEditMapping.isVisible().catch(() => false)) {
    await firstEditMapping.click()
    await waitForContent(page)
    await shot(page, 'mapping-edit.png')
    await page.goto(`${BASE_URL}/mapping`)
    await waitForContent(page)
  }

  // ── Add mapping form ──────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/add/mapping`)
  await waitForContent(page)
  await shot(page, 'mapping-create.png')

  // ── Solutions list ────────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/solutions`)
  await waitForContent(page)
  await shot(page, 'solutions-list.png')

  // ── Solution edit (first row) ─────────────────────────────────────────────
  const firstEditSolution = page.locator('[aria-label="edit"]').first()
  if (await firstEditSolution.isVisible().catch(() => false)) {
    await firstEditSolution.click()
    await waitForContent(page)
    await shot(page, 'solution-info.png')

    // Scroll down to operations section
    await page.evaluate(() => window.scrollBy(0, 400))
    await shot(page, 'solution-operations.png')

    await page.goto(`${BASE_URL}/solutions`)
    await waitForContent(page)
  }

  // ── Add solution form ─────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/add/solution`)
  await waitForContent(page)
  await shot(page, 'solution-create.png')

  // ── Pipelines list ────────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/manage`)
  await waitForContent(page)
  await shot(page, 'pipelines-list.png')

  // ── Pipeline edit (first row) ─────────────────────────────────────────────
  const firstEditPipeline = page.locator('[aria-label="edit"]').first()
  if (await firstEditPipeline.isVisible().catch(() => false)) {
    await firstEditPipeline.click()
    await waitForContent(page)
    await shot(page, 'pipeline-info.png')

    // Scroll to endpoints section
    await page.evaluate(() => window.scrollBy(0, 400))
    await shot(page, 'pipeline-endpoints.png')

    await page.goto(`${BASE_URL}/manage`)
    await waitForContent(page)
  }

  // ── Add pipeline form ─────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/add/pipeline`)
  await waitForContent(page)
  await shot(page, 'pipeline-create.png')

  await browser.close()
  console.log(`\nDone. Screenshots saved to ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
