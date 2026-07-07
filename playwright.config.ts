import { defineConfig } from '@playwright/test'

// Reusable authenticated session captured once by the `setup` project and
// shared across the browser projects so each spec does not re-login to Okta.
const STORAGE_STATE = 'e2e/.auth/user.json'

// The user-guide screenshot capture spec requires a headed browser and a
// manual Okta login; it must never run as part of the headless e2e suite.
const SCREENSHOTS_SPEC = /capture-screenshots\.spec\.ts/

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
    baseURL: process.env.BASE_URL || 'https://dev.xform-ui.izgateway.org',
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Logs in via Okta once per test run and saves the session to STORAGE_STATE.
    // testDir is set to ./e2e (not ./e2e/tests) because auth.setup.ts lives there.
    {
      name: 'setup',
      testDir: './e2e',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'Chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore: SCREENSHOTS_SPEC,
    },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore: SCREENSHOTS_SPEC,
    },
    {
      name: 'WebKit',
      use: {
        browserName: 'webkit',
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore: SCREENSHOTS_SPEC,
    },
    // Headed, manual-login project used only for user-guide screenshot capture.
    {
      name: 'screenshots',
      testMatch: SCREENSHOTS_SPEC,
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        headless: false,
      },
    },
  ],
})
