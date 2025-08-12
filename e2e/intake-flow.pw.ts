import { test, expect } from "@playwright/test"

test.describe("Intake flow", () => {
  test("designer selection redirects to intake", async ({ page }) => {
    await page.route("**/api/chat", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          field_id: "room",
          next_question: "Which room?",
          input_type: "singleSelect",
          choices: ["Living room", "Bedroom"]
        })
      })
    )

    await page.goto("/designers")
    await page.getByRole("link", { name: /start with color therapist/i }).click()

    await expect(page).toHaveURL(/\/intake$/)
    await expect(page.getByText("Which room?")).toBeVisible()
  })

  test("unauthenticated reveal round-trips through sign-in", async ({ page }) => {
    await page.route("**/api/chat", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          field_id: "_complete",
          next_question: "Ready?",
          input_type: "text"
        })
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
    await page.getByRole("button", { name: /reveal my palette/i }).click()

    await expect(page).toHaveURL(/\/sign-in\?next=%2Fintake%3Fresume%3Dreveal/)

    await page.evaluate(() => {
      const p = new URLSearchParams(window.location.search)
      window.location.href = p.get("next")!
    })

    await expect(page).toHaveURL(/\/reveal\/story-123/)
  })
})
