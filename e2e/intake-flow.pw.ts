import { test, expect } from "@playwright/test"

test.describe("Intake flow", () => {
  test("designer selection redirects to intake", async ({ page }) => {
    await page.route("**/api/intakes/start", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sessionId: "sess1",
          step: {
            type: "question",
            node: {
              question: "Which room?",
              options: ["Living room", "Bedroom"]
            }
          }
        })
      })
    )

    await page.goto("/designers")
    await page.getByRole("link", { name: /start with color therapist/i }).click()

    await expect(page).toHaveURL(/\/intake$/)
    await expect(page.getByRole("button", { name: /start voice chat/i })).toBeVisible()
  })

  test("unauthenticated reveal round-trips through sign-in", async ({ page }) => {
    await page.route("**/api/intakes/start", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sessionId: "sess1",
          step: {
            type: "question",
            node: {
              question: "Brand?",
              options: ["Sherwin-Williams", "Behr"]
            }
          }
        })
      })
    )

    await page.route("**/api/intakes/step", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ step: { type: "done" } })
      })
    )

    await page.route("**/api/intakes/finalize", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ input: {}, palette_v2: { swatches: [] } })
      })
    )

    let call = 0
    await page.route("**/api/stories", route => {
      call++
      if (call === 1) {
        route.fulfill({ status: 401, contentType: "application/json", body: "{}" })
      } else {
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "story-123" }) })
      }
    })

    await page.goto("/intake")
    await page.getByRole("button", { name: /start voice chat/i }).click()
    await page.getByRole("button", { name: /sherwin/i }).click()

    await expect(page).toHaveURL(/\/sign-in$/)

    await page.goto("/intake")
    await page.getByRole("button", { name: /start voice chat/i }).click()
    await page.getByRole("button", { name: /sherwin/i }).click()

    await expect(page).toHaveURL(/\/reveal\/story-123/)
  })
})
