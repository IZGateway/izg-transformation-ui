import { test, expect, Page } from '@playwright/test'

async function navigateViaMenu(page: Page, label: string, urlPattern: RegExp) {
  await page.getByRole('button', { name: 'toggle navigation drawer' }).click()
  await page.locator(`[id="${label}_button"]`).click()
  await expect(page).toHaveURL(urlPattern)
}

test.describe('Primary navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/manage')
    await expect(page.locator('#title-table')).toBeVisible()
  })

  test('renders the navigation drawer and logout control', async ({ page }) => {
    await expect(page.locator('#navigation')).toBeVisible()
    await expect(page.locator('#logout')).toBeVisible()
  })

  test('navigates between the three primary sections', async ({ page }) => {
    await navigateViaMenu(page, 'Solutions Creator', /\/solutions/)
    await expect(page.locator('#title-table')).toHaveText('Solutions Creator')

    await navigateViaMenu(page, 'Mapping', /\/mapping/)
    await expect(page.locator('#title-table')).toHaveText('Mapping')

    await navigateViaMenu(page, 'Manage Pipelines', /\/manage/)
    await expect(page.locator('#title-table')).toHaveText('My Pipelines')
  })
})
