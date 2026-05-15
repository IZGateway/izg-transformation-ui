import { test } from '@playwright/test'
import { loginToOkta } from '../helpers/oktaLogin'
import * as path from 'path'
import * as fs from 'fs'

const OUT_DIR = path.resolve(__dirname, '../../public/help/images')

test.beforeAll(() => {
  const requiredVars = ['OKTA_USERNAME', 'OKTA_PASSWORD', 'BASE_URL']
  const missing = requiredVars.filter((v) => !process.env[v])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
})

/** Capture a viewport screenshot to public/help/images/. */
async function shot(page: import('@playwright/test').Page, filename: string) {
  const file = path.join(OUT_DIR, filename)
  await page.screenshot({ path: file, fullPage: false })
  console.log(`  ✓ ${filename}`)
}

/** Wait for the page to settle after navigation. */
async function waitForContent(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
}

test.describe('User guide screenshots', () => {
  test.setTimeout(300000)

  test('capture all help screenshots', async ({ page }) => {
    await loginToOkta(page, process.env.OKTA_USERNAME!, process.env.OKTA_PASSWORD!)

    console.log('\nCapturing screenshots…')

    // ── Login page ──────────────────────────────────────────────────────────
    await page.goto('/api/auth/signin')
    await waitForContent(page)
    await shot(page, 'login.png')

    // Re-authenticate and land on the app
    await loginToOkta(page, process.env.OKTA_USERNAME!, process.env.OKTA_PASSWORD!)

    // ── Navigation shell ────────────────────────────────────────────────────
    await page.goto('/')
    await waitForContent(page)
    await shot(page, 'navigation-shell.png')
    await shot(page, 'navigation-sidebar.png')

    // ── Mappings list ────────────────────────────────────────────────────────
    await page.goto('/mapping')
    await waitForContent(page)
    await shot(page, 'mappings-list.png')

    // ── Mapping edit (first row) ─────────────────────────────────────────────
    const firstEditMapping = page.locator('[aria-label="edit"]').first()
    if (await firstEditMapping.isVisible().catch(() => false)) {
      await firstEditMapping.click()
      await waitForContent(page)
      await shot(page, 'mapping-edit.png')
      await page.goto('/mapping')
      await waitForContent(page)
    }

    // ── Add mapping form ─────────────────────────────────────────────────────
    await page.goto('/add/mapping')
    await waitForContent(page)
    await shot(page, 'mapping-create.png')

    // ── Solutions list ────────────────────────────────────────────────────────
    await page.goto('/solutions')
    await waitForContent(page)
    await shot(page, 'solutions-list.png')

    // ── Solution edit (first row) ────────────────────────────────────────────
    const firstEditSolution = page.locator('[aria-label="edit"]').first()
    if (await firstEditSolution.isVisible().catch(() => false)) {
      await firstEditSolution.click()
      await waitForContent(page)
      await shot(page, 'solution-info.png')
      await page.evaluate(() => window.scrollBy(0, 400))
      await shot(page, 'solution-operations.png')
      await page.goto('/solutions')
      await waitForContent(page)
    }

    // ── Add solution form ────────────────────────────────────────────────────
    await page.goto('/add/solution')
    await waitForContent(page)
    await shot(page, 'solution-create.png')

    // ── Pipelines list ────────────────────────────────────────────────────────
    await page.goto('/manage')
    await waitForContent(page)
    await shot(page, 'pipelines-list.png')

    // ── Pipeline edit (first row) ────────────────────────────────────────────
    const firstEditPipeline = page.locator('[aria-label="edit"]').first()
    if (await firstEditPipeline.isVisible().catch(() => false)) {
      await firstEditPipeline.click()
      await waitForContent(page)
      await shot(page, 'pipeline-info.png')
      await page.evaluate(() => window.scrollBy(0, 400))
      await shot(page, 'pipeline-endpoints.png')
      await page.goto('/manage')
      await waitForContent(page)
    }

    // ── Add pipeline form ─────────────────────────────────────────────────────
    await page.goto('/add/pipeline')
    await waitForContent(page)
    await shot(page, 'pipeline-create.png')

    console.log(`\nDone. Screenshots saved to ${OUT_DIR}`)
  })
})
