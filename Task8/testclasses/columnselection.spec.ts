import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class ColumnSelectionTest {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async test() {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    await this.page.locator('#canvas').click({ position: { x: 596, y: 116 } });
    await this.page.locator('#canvas').click({ position: { x: 681, y: 2 } });
  }
}

