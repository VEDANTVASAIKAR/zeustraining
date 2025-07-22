import { test, expect } from '@playwright/test';

test('row drag selection', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/Task8/index.html');
    await page.mouse.move(10, 106);
    await page.mouse.down();
    await page.mouse.move(10, 286, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(2000);
});