import { test as setup } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const authFile = 'playwright/.auth/user.json'

// Opens a headed browser so you can complete Okta login + MFA manually.
// Once you land on the app, the session is saved to playwright/.auth/user.json
// and all subsequent `capture-screenshots` runs reuse it headlessly.
setup('save auth state', async ({ page }) => {
  console.log('\n─────────────────────────────────────────────────────────────────')
  console.log('  Please log in via the browser window that just opened.')
  console.log('  Complete all Okta MFA steps as normal.')
  console.log('  This script will detect when you reach the app and save your session.')
  console.log('─────────────────────────────────────────────────────────────────\n')

  await page.goto('/')

  // Wait up to 3 minutes for the user to complete full login including MFA.
  await page.waitForURL(
    (url) => !url.href.includes('okta.com') && !url.href.includes('/api/auth/'),
    { timeout: 180000 }
  )
  await page.waitForLoadState('networkidle')

  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
  console.log(`\n✓ Auth state saved to ${authFile}`)
  console.log('  You can now run "npm run capture-screenshots" headlessly.\n')
})
