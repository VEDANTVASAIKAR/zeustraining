import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class RowSelectionTest {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async test() {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    await this.page.locator('#canvas').click({ position: { x: 589, y: 104 } });
    await this.page.locator('#canvas').click({ position: { x: 36, y: 210 } });
  }
}
