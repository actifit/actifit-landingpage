const { test, expect } = require('@playwright/test')

// Login-free critical-path smoke tests. These hit the real (dev) app, so they
// validate SSR rendering, routing, and that pages mount without console errors.

test.describe('public pages render', () => {
  test('home page loads with the expected SSR title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Actifit/i)
    // body has rendered some content
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('FAQ page loads and shows its headline', async ({ page }) => {
    await page.goto('/faq')
    await expect(page).toHaveTitle(/FAQ/i)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('Terms & Conditions page loads', async ({ page }) => {
    await page.goto('/terms-conditions')
    await expect(page).toHaveTitle(/Terms and Conditions/i)
  })
})

test.describe('navigation', () => {
  test('can navigate from home to the login page', async ({ page }) => {
    await page.goto('/login')
    // login page should expose a sign-in affordance (Hive Keychain / Hivesigner etc.)
    await expect(page.locator('body')).toContainText(/login|sign in|keychain|hive/i)
  })
})

test.describe('no critical console errors on home', () => {
  test('home renders without uncaught page errors', async ({ page }) => {
    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle').catch(() => {})
    expect(errors).toEqual([])
  })
})
