import { test, expect } from '@playwright/test';

test('multi-select with Control key held down', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/Task8/index.html');

    await page.keyboard.down('Control');

    await page.locator('#canvas').click({ position: { x: 374, y: 108 } });
    await page.waitForTimeout(1000);
    await page.locator('#canvas').click({ position: { x: 611, y: 10 } });
    await page.waitForTimeout(1000);
    await page.locator('#canvas').click({ position: { x: 686, y: 6 } });
    await page.waitForTimeout(1000);
    await page.locator('#canvas').click({ position: { x: 773, y: 6 } });
    await page.waitForTimeout(1000);
    await page.locator('#canvas').click({ position: { x: 33, y: 188 } });
    await page.waitForTimeout(1000);
    await page.locator('#canvas').click({ position: { x: 31, y: 211 } });
    await page.waitForTimeout(1000);
    await page.locator('#canvas').click({ position: { x: 33, y: 236 } });
    await page.waitForTimeout(1000);
    // await page.locator('#canvas').click({ position: { x: 287, y: 431 } });
    await page.mouse.move(287, 431);
    await page.mouse.down();
    await page.mouse.move(387, 631, { steps: 5 });
    await page.mouse.up();

    await page.waitForTimeout(3000);
});