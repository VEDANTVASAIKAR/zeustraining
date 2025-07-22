import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class CtrlSelectionTest {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async test() {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    await this.page.keyboard.down('Control');
    await this.page.locator('#canvas').click({ position: { x: 374, y: 108 } });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#canvas').click({ position: { x: 611, y: 10 } });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#canvas').click({ position: { x: 686, y: 6 } });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#canvas').click({ position: { x: 773, y: 6 } });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#canvas').click({ position: { x: 33, y: 188 } });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#canvas').click({ position: { x: 31, y: 211 } });
    await this.page.waitForTimeout(1000);
    await this.page.locator('#canvas').click({ position: { x: 33, y: 236 } });
    await this.page.waitForTimeout(1000);
    await this.page.mouse.move(287, 431);
    await this.page.mouse.down();
    await this.page.mouse.move(387, 631, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(3000);
  }
}

