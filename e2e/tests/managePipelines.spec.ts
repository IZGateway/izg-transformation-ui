import { test, expect } from '@playwright/test'

test.describe('Manage Pipelines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/manage')
    await expect(page.locator('#title-table')).toHaveText('My Pipelines')
  })

  test('renders the pipelines list', async ({ page }) => {
    await expect(page.locator('.MuiDataGrid-root')).toBeVisible()
    await expect(page.locator('.MuiDataGrid-row').first()).toBeVisible()
  })

  test('quick filter narrows the list', async ({ page }) => {
    const rows = page.locator('.MuiDataGrid-row')
    await expect(rows.first()).toBeVisible()

    const search = page.getByPlaceholder('Search…')
    await search.fill('zzz-no-such-pipeline-zzz')
    await expect(rows).toHaveCount(0)

    await search.fill('')
    await expect(rows.first()).toBeVisible()
  })

  test('opens the create pipeline form (no submit)', async ({ page }) => {
    await page.locator('#add-new-pipeline').click()
    await expect(page).toHaveURL(/\/add\/pipeline/)
    await expect(page.getByRole('heading', { name: 'New Pipeline' })).toBeVisible()
  })

  test('opens an existing pipeline for editing (no submit)', async ({ page }) => {
    await page.locator('[aria-label="edit"]').first().click()
    await expect(page).toHaveURL(/\/edit\/pipeline\//)
    await expect(page.locator('#title-pipeline')).toBeVisible()
  })

  test('exposes the enable/disable (soft-delete) control', async ({ page }) => {
    const toggle = page.locator('[aria-label="toggle-pipeline-status"]').first()
    await expect(toggle).toBeVisible()
    await expect(toggle).toBeEnabled()
  })
})
