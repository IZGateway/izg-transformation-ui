#!/usr/bin/env node
/**
 * Playwright validation script for the Xform Console HelpPanel.
 *
 * Navigates to every page that has a HelpButton wired, clicks it, asserts the
 * HelpPanel drawer is visible and contains non-empty text, then closes it.
 *
 * Prerequisites:
 *   - A running Xform Console instance at XFORM_BASE_URL
 *   - Valid Okta credentials for XFORM_USERNAME / XFORM_PASSWORD
 *   - Playwright browsers installed: npx playwright install chromium
 *
 * Usage:
 *   XFORM_BASE_URL=https://xform.example.com \
 *   XFORM_USERNAME=user@example.com \
 *   XFORM_PASSWORD=secret \
 *   npm run validate-help-panel
 *
 * Exit code: 0 on success, 1 on any failure.
 */

const { chromium } = require('@playwright/test')

const BASE_URL = process.env.XFORM_BASE_URL
const USERNAME = process.env.XFORM_USERNAME
const PASSWORD = process.env.XFORM_PASSWORD

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

/**
 * Pages to validate.  Each entry describes how to reach a page and which
 * HelpPanel content is expected.
 *
 * `path`       — URL path relative to BASE_URL
 * `label`      — human-readable name for log output
 * `buttonSel`  — aria-label selector for the HelpButton
 * `drawerSel`  — selector for the rendered HelpPanel drawer
 */
const PAGES = [
  {
    path: '/mapping',
    label: 'Mappings list',
    buttonSel: '[aria-label="Help"]',
    drawerSel: '.MuiDrawer-root',
  },
  {
    path: '/add/mapping',
    label: 'Add Mapping',
    buttonSel: '[aria-label="Help"]',
    drawerSel: '.MuiDrawer-root',
  },
  {
    path: '/solutions',
    label: 'Solutions list',
    buttonSel: '[aria-label="Help"]',
    drawerSel: '.MuiDrawer-root',
  },
  {
    path: '/add/solution',
    label: 'Add Solution',
    buttonSel: '[aria-label="Help"]',
    drawerSel: '.MuiDrawer-root',
  },
  {
    path: '/manage',
    label: 'Pipelines list',
    buttonSel: '[aria-label="Help"]',
    drawerSel: '.MuiDrawer-root',
  },
  {
    path: '/add/pipeline',
    label: 'Add Pipeline',
    buttonSel: '[aria-label="Help"]',
    drawerSel: '.MuiDrawer-root',
  },
]

async function login(page) {
  await page.goto(`${BASE_URL}/`)
  // Wait for Okta redirect
  await page.waitForURL(/okta\.com|\/login/, { timeout: 15000 }).catch(() => {})

  const usernameField = page.locator('input[name="identifier"], input[type="email"]').first()
  await usernameField.waitFor({ timeout: 15000 })
  await usernameField.fill(USERNAME)

  const nextBtn = page.locator('input[type="submit"], button[type="submit"]').first()
  if (await nextBtn.isVisible()) await nextBtn.click()

  const passwordField = page.locator('input[type="password"]').first()
  await passwordField.waitFor({ timeout: 10000 })
  await passwordField.fill(PASSWORD)
  await passwordField.press('Enter')

  await page.waitForURL(`${BASE_URL}/**`, { timeout: 20000 })
  console.log('  ✓ Logged in')
}

async function validatePage(page, { path: urlPath, label, buttonSel, drawerSel }) {
  console.log(`\nValidating: ${label} (${urlPath})`)
  await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: 'networkidle' })

  const button = page.locator(buttonSel).first()
  await button.waitFor({ state: 'visible', timeout: 10000 })
  await button.click()

  const drawer = page.locator(drawerSel).last()
  await drawer.waitFor({ state: 'visible', timeout: 8000 })

  const text = await drawer.innerText()
  if (!text || text.trim().length === 0) {
    throw new Error(`HelpPanel for "${label}" is visible but has no content`)
  }
  console.log(`  ✓ HelpPanel opened with content (${text.trim().length} chars)`)

  // Close via Escape key
  await page.keyboard.press('Escape')
  console.log(`  ✓ HelpPanel closed`)
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  let failed = false
  try {
    await login(page)

    for (const pageSpec of PAGES) {
      try {
        await validatePage(page, pageSpec)
      } catch (err) {
        console.error(`  ✗ FAILED: ${err.message}`)
        failed = true
      }
    }
  } catch (err) {
    console.error(`\nFATAL: ${err.message}`)
    failed = true
  } finally {
    await browser.close()
  }

  if (failed) {
    console.error('\nValidation FAILED — see errors above.')
    process.exit(1)
  } else {
    console.log('\nAll pages validated successfully.')
    process.exit(0)
  }
})()
