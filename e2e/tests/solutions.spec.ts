import { test, expect } from '@playwright/test'

test.describe('Solutions Creator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/solutions')
    await expect(page.locator('#title-table')).toHaveText('Solutions Creator')
  })

  test('renders the solutions list', async ({ page }) => {
    await expect(page.locator('.MuiDataGrid-root')).toBeVisible()
    await expect(page.locator('.MuiDataGrid-row').first()).toBeVisible()
  })

  test('quick filter narrows the list', async ({ page }) => {
    const rows = page.locator('.MuiDataGrid-row')
    await expect(rows.first()).toBeVisible()

    const search = page.getByPlaceholder('Search…')
    await search.fill('zzz-no-such-solution-zzz')
    await expect(rows).toHaveCount(0)

    await search.fill('')
    await expect(rows.first()).toBeVisible()
  })

  test('opens the create solution form (no submit)', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Solution' }).click()
    await expect(page).toHaveURL(/\/add\/solution/)
    await expect(page.getByRole('button', { name: 'Save Solution' })).toBeVisible()
  })

  test('opens an existing solution for editing (no submit)', async ({ page }) => {
    await page.locator('[aria-label="edit"]').first().click()
    await expect(page).toHaveURL(/\/edit\/solution\//)
    await expect(page.getByTestId('settings-container')).toBeVisible()
  })
})
