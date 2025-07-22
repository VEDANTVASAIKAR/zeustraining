import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class ColumnDragSelectionTest {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async test() {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    await this.page.mouse.move(570, 56);
    await this.page.mouse.down();
    await this.page.mouse.move(850, 56, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(2000);
  }
}
