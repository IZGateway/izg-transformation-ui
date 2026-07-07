import { test, expect, Page } from '@playwright/test'
import { dragCard } from '../helpers/dragAndDrop'

async function readSolutionNames(page: Page): Promise<string[]> {
  const raw = await page.getByTestId('solution-name').allInnerTexts()
  return raw.map((text) => text.replace(/^\s*\d+\.\s*/, '').trim())
}

test.describe('Pipeline solution reorder', () => {
  test('reorders configured solutions within a pipeline (without saving)', async ({ page }) => {
    await page.goto('/manage')
    await expect(page.locator('#title-table')).toHaveText('My Pipelines')

    await page.locator('[aria-label="edit"]').first().click()
    await expect(page).toHaveURL(/\/edit\/pipeline\//)
    await expect(page.locator('#title-pipeline')).toBeVisible()
    await expect(page.getByTestId('solutions-modified-container')).toBeVisible()

    const cards = page.getByTestId(/^solution-card-container-\d+$/)
    const cardCount = await cards.count()
    test.skip(
      cardCount < 2,
      'Selected pipeline has fewer than 2 configured solutions; cannot exercise reorder.'
    )

    await page.getByTestId('reorder-button').click()
    await expect(page.getByTestId('cancel-button')).toBeVisible()

    const before = await readSolutionNames(page)

    await dragCard(
      page,
      page.getByTestId('solution-card-container-1'),
      page.getByTestId('solution-card-container-2')
    )

    const after = await readSolutionNames(page)
    expect(after).not.toEqual(before)

    await page.getByTestId('cancel-button').click()
  })
})
