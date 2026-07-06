import { Locator, Page } from '@playwright/test'

/**
 * Performs a pointer-based drag from `source` to `target`.
 *
 * The Configured Solutions grid uses `@dnd-kit`'s `PointerSensor`, which only
 * begins a drag after a pointer-down followed by pointer movement. Playwright's
 * built-in `dragTo` does not reliably trigger it, so we drive the mouse
 * manually: press, nudge to activate the sensor, move across in small steps,
 * settle over the target, then release.
 */
export async function dragCard(page: Page, source: Locator, target: Locator) {
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()

  if (!sourceBox || !targetBox) {
    throw new Error('dragCard: source or target is not visible')
  }

  const startX = sourceBox.x + sourceBox.width / 2
  const startY = sourceBox.y + sourceBox.height / 2
  const endX = targetBox.x + targetBox.width / 2
  const endY = targetBox.y + targetBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  // Small initial nudge to activate the @dnd-kit PointerSensor.
  await page.mouse.move(startX + 8, startY + 8, { steps: 6 })
  await page.mouse.move(endX, endY, { steps: 25 })
  // Settle over the target so the "over" target resolves before dropping.
  await page.mouse.move(endX + 2, endY + 2, { steps: 6 })
  await page.waitForTimeout(150)
  await page.mouse.up()
  await page.waitForTimeout(300)
}
