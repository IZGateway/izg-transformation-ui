import { test as setup } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { loginToOkta } from './helpers/oktaLogin'

const STORAGE_STATE = 'e2e/.auth/user.json'

setup('authenticate via Okta', async ({ page }) => {
  const username = process.env.OKTA_USERNAME
  const password = process.env.OKTA_PASSWORD

  if (!username || !password) {
    throw new Error(
      'OKTA_USERNAME and OKTA_PASSWORD must be set (in .env.test locally, or as CI secrets) before running the e2e suite.'
    )
  }

  await loginToOkta(page, username, password)

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true })
  await page.context().storageState({ path: STORAGE_STATE })
})
