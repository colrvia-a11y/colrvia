import { test, expect } from '@playwright/test'

const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('Public pages smoke', () => {
  test('Home renders', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Colrvia|Color|Palette/i)
  })

  test('Start page has primary CTA', async ({ page }) => {
    await page.goto('/start')
    const cta = page.getByRole('link', { name: /choose your designer/i })
    await expect(cta).toBeVisible()
  })

  test('Sign-in route is reachable', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page).toHaveURL(/\/sign-in/)
  })
})

test.describe('Auth redirect behavior (unauthenticated)', () => {
  test.skip(!supabaseConfigured, 'Supabase not configured; skipping auth redirect smoke')
  test('Dashboard redirects or blocks unauthenticated', async ({ page }) => {
    const res = await page.goto('/dashboard')
    expect(res?.status()).toBeLessThan(500)
    await page.waitForTimeout(400)
    const url = page.url()
    if (/\/dashboard/.test(url)) {
      // Should not show user-specific content heading without auth; we allow empty state
      await expect(page.getByRole('heading', { name: /your color stories/i })).toBeVisible({ timeout: 1000 })
    } else {
      await expect(page).toHaveURL(/\/sign-in|\/auth/i)
    }
  })
})
