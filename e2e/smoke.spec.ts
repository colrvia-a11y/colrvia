// Prevent execution under Vitest (unit test run) to avoid conflicts
// @ts-ignore
if ((globalThis as any).vi) {
  // Skip defining Playwright tests when running Vitest
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { test, expect } = require('@playwright/test') as typeof import('@playwright/test')

  test.describe('Public pages smoke', () => {
    test('Home renders', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/Colrvia|Color|Palette/i)
    })

    test('Start page has primary CTA', async ({ page }) => {
      await page.goto('/start')
      const cta = page.getByRole('button', { name: /get my palette|reveal|generate/i })
      await expect(cta).toBeVisible()
    })

    test('Sign-in route is reachable', async ({ page }) => {
      await page.goto('/sign-in')
      await expect(page).toHaveURL(/\/sign-in/)
    })
  })

  test.describe('Auth redirect behavior (unauthenticated)', () => {
    test('Dashboard redirects to sign-in', async ({ page }) => {
      const res = await page.goto('/dashboard')
      expect(res?.status()).toBeLessThan(400)
      await expect(page).toHaveURL(/\/sign-in|\/auth/i)
    })
  })
}
