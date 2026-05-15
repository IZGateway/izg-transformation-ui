import { defineConfig } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: require.resolve('./playwright.env.setup'),
  timeout: 60000,
  workers: 1,
  retries: 2,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 20000,
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
    launchOptions: {
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
    },
    screenshot: 'off',
  },
  projects: [
    {
      // Run once with "npm run auth-setup" to save your Okta session (including MFA).
      name: 'setup',
      testDir: './e2e/setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        headless: false,
        ignoreHTTPSErrors: true,
      },
    },
    {
      // Uses saved auth state — run "npm run auth-setup" first if session expired.
      name: 'Chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        storageState: authFile,
      },
    },
  ],
})
