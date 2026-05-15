import { Page, Locator, expect } from '@playwright/test'

const setInputValue = async (locator: Locator, value: string) => {
  await locator.evaluate((el, val) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!.set!
    setter.call(el, val)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

export const loginToOkta = async (
  page: Page,
  username: string,
  password: string
) => {
  if (typeof username !== 'string' || username.length === 0) {
    throw new Error(
      'loginToOkta: username is missing or empty (check OKTA_USERNAME in .env.test)'
    )
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error(
      'loginToOkta: password is missing or empty (check OKTA_PASSWORD in .env.test)'
    )
  }

  // Navigate to the app root — NextAuth will redirect to /api/auth/signin if not signed in.
  await expect(async () => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })
  }).toPass({ timeout: 60000, intervals: [2000] })

  const signInWithOktaButton = page.getByRole('button', {
    name: /sign in with okta/i,
  })
  const identifierInput = page.locator(
    'input[name="identifier"], input#okta-signin-username'
  )
  const passwordInput = page.locator(
    'input[name="credentials.passcode"], input[name="password"], input#okta-signin-password'
  )

  // If already authenticated (landed on an app route), return immediately.
  if (
    page.url().includes('/manage') ||
    page.url().includes('/solutions') ||
    page.url().includes('/mapping')
  ) {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    return
  }

  // NextAuth default sign-in page shows "Sign in with Okta" — click it to
  // be redirected to the Okta hosted login form.
  if (await signInWithOktaButton.isVisible().catch(() => false)) {
    await signInWithOktaButton.click()
  }

  // Wait for the Okta identifier field.
  await expect(async () => {
    expect(await identifierInput.first().isVisible().catch(() => false)).toBeTruthy()
  }).toPass({ timeout: 45000 })

  await setInputValue(identifierInput.first(), username)
  await page.locator('[type="submit"]').first().click()

  // Wait for Okta to transition away from identifier step — may land on:
  // 1. Password input directly
  // 2. Factor selector (.button.select-factor.link-button)
  // 3. Authenticator list screen (#form52 with Email/Password options)
  await page
    .locator(
      'input[name="credentials.passcode"], input[name="password"], .button.select-factor.link-button'
    )
    .first()
    .waitFor({ state: 'visible', timeout: 30000 })

  // Handle authenticator selection screen (Email / Password list)
  const authenticatorListExists = (await page.locator('#form52').count()) > 0
  if (authenticatorListExists) {
    await page.locator('[data-se="okta_password"] a[data-se="button"]').click()
    await page
      .locator('input[name="credentials.passcode"]')
      .waitFor({ state: 'visible', timeout: 15000 })
  }

  await setInputValue(passwordInput.first(), password)
  await page.locator('[type="submit"]').first().click()

  // Wait until the app lands on a known authenticated route.
  await expect(async () => {
    const url = page.url()
    expect(
      url.includes('/manage') || url.includes('/solutions') || url.includes('/mapping')
    ).toBeTruthy()
  }).toPass({ timeout: 60000, intervals: [2000] })

  await page.goto('/')
  await page.waitForLoadState('networkidle')
}
