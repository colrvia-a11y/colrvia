import { test, expect } from "@playwright/test"

test.describe("Intake flow", () => {
  test("designer selection, chat progression, and reveal redirect", async ({ page }) => {
    await page.route("**/api/intakes/start", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sessionId: "sess1",
          step: {
            type: "question",
            node: { question: "Which room?", options: ["Living room", "Bedroom"] }
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
        body: JSON.stringify({ input: { brand: "SW" }, palette_v2: [] })
      })
    )

    await page.route("**/api/stories", route =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "story-123" })
      })
    )

    await page.goto("/designers")
    await page.getByRole("link", { name: /start with color therapist/i }).click()

    await expect(page).toHaveURL(/\/preferences\/therapist$/)
    const chat = page.getByRole("dialog", { name: "Preferences chat" })
    await expect(chat).toBeVisible()
    await expect(page.getByText("Which room?")).toBeVisible()

    await page.getByRole("button", { name: "Living room" }).click()

    await expect(page).toHaveURL(/\/reveal\/story-123$/)
  })
})
