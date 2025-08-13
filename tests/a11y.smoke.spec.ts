import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("intake page a11y smoke", async ({ page }) => {
  await page.goto("/intake");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(v => v.impact === "critical")).toEqual([]);
});
