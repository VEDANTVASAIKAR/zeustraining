import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/Task8/index.html');
  await page.locator('#canvas').click({
    position: {
      x: 589,
      y: 104
    }
  });
  await page.locator('#canvas').click({
    position: {
      x: 36,
      y: 210
    }
  });
});