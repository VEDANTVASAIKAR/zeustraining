import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class KeyboardSelectionTest {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async test() {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    await this.page.locator('#canvas').click({ position: { x: 603, y: 212 } });
    await this.page.locator('#cellInput').fill('1');
    await this.page.locator('#cellInput').press('Enter');
    await this.page.locator('#canvas').click({ position: { x: 613, y: 233 } });
    await this.page.locator('#cellInput').fill('2');
    await this.page.locator('#canvas').click({ position: { x: 610, y: 255 } });
    await this.page.locator('#cellInput').fill('3');
    await this.page.locator('#canvas').click({ position: { x: 634, y: 286 } });
    await this.page.locator('#cellInput').fill('4');
    await this.page.locator('#canvas').click({ position: { x: 647, y: 314 } });
    await this.page.locator('#cellInput').fill('5');
    await this.page.locator('#canvas').click({ position: { x: 637, y: 209 } });
    await this.page.locator('#canvas').press('Shift+ArrowDown');
    await this.page.locator('#canvas').press('Shift+ArrowDown');
    await this.page.locator('#canvas').press('Shift+ArrowDown');
    await this.page.locator('#canvas').press('Shift+ArrowDown');
    await this.page.getByRole('button', { name: 'Count' }).click();
    await this.page.getByRole('button', { name: 'Sum' }).click();
    await this.page.getByRole('button', { name: 'Min' }).click();
    await this.page.getByRole('button', { name: 'Max' }).click();
    await this.page.getByRole('button', { name: 'Avg' }).click();
  }
}
