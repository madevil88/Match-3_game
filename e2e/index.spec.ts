import { test, expect, type Page } from '@playwright/test';

const wrapPage = (page: Page): Page => {
    page.context().route(/%%CLICK_URL%%/gi, (route) => {
        route.fulfill({ body: '<html><head><title>Fake Title</title></head><body></body></html>' }).catch(() => {});
    }).catch(() => {});
    return page;
};

test('basic test', async ({ page }) => {
    page = wrapPage(page);
    await page.goto('/index.html');
    expect(await page.title()).toBe('Match-3 Game');
});
