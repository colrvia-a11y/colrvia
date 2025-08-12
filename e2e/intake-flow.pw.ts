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
})
