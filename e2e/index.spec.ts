import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

const collectErrors = (page: Page): ConsoleMessage[] => {
  const errors: ConsoleMessage[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg);
  });
  return errors;
};

test.describe('Match-3 Game', () => {
  test('page has correct title', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle('Match-3 Game');
  });

  test('canvas element is visible with non-zero dimensions', async ({ page }) => {
    await page.goto('/index.html');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });

  test('no JS errors on initial load', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/index.html');
    await page.waitForTimeout(1500);
    expect(errors).toHaveLength(0);
  });

  test('game runs for 3 seconds without crashing', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/index.html');
    await page.waitForTimeout(3000);
    expect(errors).toHaveLength(0);
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('clicking canvas does not throw', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/index.html');
    await page.waitForTimeout(1000);
    const box = await page.locator('canvas').boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
    }
    expect(errors).toHaveLength(0);
  });
});
