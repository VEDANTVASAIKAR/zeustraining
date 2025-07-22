import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/Task8/index.html');
    await page.mouse.move(550, 56);
    await page.mouse.down();
    await page.mouse.move(840, 56, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(4000)
});