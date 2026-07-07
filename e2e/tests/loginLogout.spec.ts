import { test, expect } from '@playwright/test'
import { loginToOkta } from '../helpers/oktaLogin'
import { logout } from '../helpers/logout'

// Run in a fresh, unauthenticated context so this spec exercises the real Okta
// login + logout flow rather than reusing the shared `setup` session.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication', () => {
  test('logs in via Okta and logs back out', async ({ page }) => {
    const username = process.env.OKTA_USERNAME
    const password = process.env.OKTA_PASSWORD
    expect(username, 'OKTA_USERNAME must be set').toBeTruthy()
    expect(password, 'OKTA_PASSWORD must be set').toBeTruthy()

    await loginToOkta(page, username as string, password as string)

    // Authenticated: the app header is present and greets the signed-in user.
    const header = page.locator('#app-header')
    await expect(header).toBeVisible()
    await expect(header).toContainText(
      'Welcome to IZ Gateway Transformation Service'
    )

    const expectedName = process.env.OKTA_EXPECTED_FULLNAME
    if (expectedName) {
      await expect(header).toContainText(expectedName)
    }

    await logout(page)

    // After logout the authenticated app header should no longer be shown.
    await expect(page.locator('#app-header')).toBeHidden()
  })
})
