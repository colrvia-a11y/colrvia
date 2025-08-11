import { test, expect } from '@playwright/test'

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
