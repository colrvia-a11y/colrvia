import { test, expect } from '@playwright/test';

test('Color story creation flow (guest) navigates to Reveal without hanging', async ({ page }) => {
  await page.goto('/start/interview');

  // Walk through up to ~10 steps; click first visible choice or fill text.
  for (let step = 0; step < 10; step++) {
    if (await page.locator('text=All set').first().isVisible()) break;

    if (await page.locator('.rt-chips button').first().isVisible()) {
      await page.locator('.rt-chips button').first().click();
    } else if (await page.locator('input[placeholder="Type your answer…"]').isVisible()) {
      await page.fill('input[placeholder="Type your answer…"]', 'Test');
      await page.keyboard.press('Enter');
    }

    const continueBtn = page.getByRole('button', { name: /Continue/i });
    if (await continueBtn.isEnabled()) await continueBtn.click();
  }

  await expect(page.getByRole('button', { name: /Create my color story/i })).toBeVisible();
  await page.getByRole('button', { name: /Create my color story/i }).click();

  await page.waitForURL(/\/reveal\/.+/);
  expect(page.url()).toMatch(/\/reveal\/[^/]+$/);
  expect(page.url()).not.toContain('/start/processing');
  await expect(page.getByText("Sign in to view this story.")).toBeVisible();
});
