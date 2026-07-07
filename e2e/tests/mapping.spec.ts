import { test, expect } from '@playwright/test'

test.describe('Mapping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mapping')
    await expect(page.locator('#title-table')).toHaveText('Mapping')
  })

  test('renders the mapping list with status badges', async ({ page }) => {
    await expect(page.locator('.MuiDataGrid-root')).toBeVisible()
    const firstRow = page.locator('.MuiDataGrid-row').first()
    await expect(firstRow).toBeVisible()
    await expect(firstRow).toContainText(/Active|Not Active/)
  })

  test('quick filter narrows the list', async ({ page }) => {
    const rows = page.locator('.MuiDataGrid-row')
    await expect(rows.first()).toBeVisible()

    const search = page.getByPlaceholder('Search…')
    await search.fill('zzz-no-such-mapping-zzz')
    await expect(rows).toHaveCount(0)

    await search.fill('')
    await expect(rows.first()).toBeVisible()
  })

  test('opens the create mapping form (no submit)', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Mapping' }).click()
    await expect(page).toHaveURL(/\/add\/mapping/)
    await expect(page.getByRole('heading', { name: 'Add Mapping Entry' })).toBeVisible()
  })

  test('opens an existing mapping for editing (no submit)', async ({ page }) => {
    await page.locator('[aria-label="edit"]').first().click()
    await expect(page).toHaveURL(/\/edit\/mapping\//)
    await expect(page.getByRole('heading', { name: 'Edit Mapping Entry' })).toBeVisible()
  })
})
