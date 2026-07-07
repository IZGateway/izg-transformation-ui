import { Page, expect } from '@playwright/test'

/**
 * Signs the current user out of the Xform Console.
 *
 * The logout button calls NextAuth `signOut()` and then redirects to the Okta
 * sign-out URL, so afterwards the app header should be gone and the browser
 * should land on an Okta sign-out / sign-in surface.
 */
export const logout = async (page: Page) => {
  await page.locator('#logout').click({ force: true })

  const appHeader = page.locator('#app-header')
  const oktaIdentifier = page.locator(
    'input[name="identifier"], input#okta-signin-username'
  )

  await expect(async () => {
    const url = page.url()
    const hasAppHeader = await appHeader.isVisible().catch(() => false)
    const hasIdentifier = await oktaIdentifier
      .first()
      .isVisible()
      .catch(() => false)
    const onOktaSignout = /\/login\/signout|okta|signin/i.test(url)

    if (!hasAppHeader || hasIdentifier || onOktaSignout) {
      return
    }

    throw new Error(`Logout did not complete yet. Current URL: ${url}`)
  }).toPass({ timeout: 30000 })
}
