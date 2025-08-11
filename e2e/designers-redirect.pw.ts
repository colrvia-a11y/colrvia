import { test, expect } from "@playwright/test"

test.describe("Designers slug redirects", () => {
  test("therapist redirects to start with guide", async ({ page }) => {
    const res = await page.goto("/designers/therapist")
    expect(res?.status()).toBeLessThan(400)
    await expect(page).toHaveURL(/\/start\?guide=therapist/)
  })

  test("mae redirects to start with guide", async ({ page }) => {
    await page.goto("/designers/mae")
    await expect(page).toHaveURL(/\/start\?guide=mae/)
  })

  test("naturalist redirects to start with guide", async ({ page }) => {
    await page.goto("/designers/naturalist")
    await expect(page).toHaveURL(/\/start\?guide=naturalist/)
  })
})
