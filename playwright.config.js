// @ts-check
const { defineConfig, devices } = require('@playwright/test')

/**
 * Playwright E2E config for the Actifit landing page.
 *
 * These tests boot the real Nuxt dev server and drive a browser against it.
 * They cover critical, login-free user journeys (page loads, navigation,
 * SSR meta). Flows requiring a Hive/Steem login are out of scope for CI since
 * they need real wallet credentials.
 *
 * Run locally with:  npm run test:e2e
 * (first time only:  npx playwright install chromium)
 */
module.exports = defineConfig({
  testDir: './e2e',
  // generous timeouts — the dev server proxies live blockchain RPC nodes
  timeout: 60 * 1000,
  expect: { timeout: 10 * 1000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  // Start the Nuxt dev server unless an external E2E_BASE_URL is supplied.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180 * 1000
      }
})
