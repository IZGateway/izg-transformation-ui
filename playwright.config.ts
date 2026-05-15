import { defineConfig } from '@playwright/test'

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
      name: 'Chrome',
      use: { browserName: 'chromium', channel: 'chrome' },
    },
  ],
})
