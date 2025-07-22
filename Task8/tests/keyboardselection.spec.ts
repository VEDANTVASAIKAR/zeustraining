import { test, expect } from '@playwright/test';

test('keyboard selection and statistics', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/Task8/index.html');
    await page.locator('#canvas').click({
        position: {
            x: 603,
            y: 212
        }
    });
    await page.locator('#cellInput').fill('1');
    await page.locator('#cellInput').press('Enter');
    await page.locator('#canvas').click({
        position: {
            x: 613,
            y: 233
        }
    });
    await page.locator('#cellInput').fill('2');
    await page.locator('#canvas').click({
        position: {
            x: 610,
            y: 255
        }
    });
    await page.locator('#cellInput').fill('3');
    await page.locator('#canvas').click({
        position: {
            x: 634,
            y: 286
        }
    });
    await page.locator('#cellInput').fill('4');
    await page.locator('#canvas').click({
        position: {
            x: 647,
            y: 314
        }
    });
    await page.locator('#cellInput').fill('5');
    await page.locator('#canvas').click({
        position: {
            x: 637,
            y: 209
        }
    });
    await page.locator('#canvas').press('Shift+ArrowDown');
    await page.locator('#canvas').press('Shift+ArrowDown');
    await page.locator('#canvas').press('Shift+ArrowDown');
    await page.locator('#canvas').press('Shift+ArrowDown');
    await page.getByRole('button', { name: 'Count' }).click();
    await page.getByRole('button', { name: 'Sum' }).click();
    await page.getByRole('button', { name: 'Min' }).click();
    await page.getByRole('button', { name: 'Max' }).click();
    await page.getByRole('button', { name: 'Avg' }).click();
});