import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';
import { ColumnDragSelectionTest } from '../testclasses/columndragselection.spec'
import { ColumnResizeTest } from '../testclasses/columnresize.spec'
import { ColumnSelectionTest } from '../testclasses/columnselection.spec'   
import { KeyboardSelectionTest } from '../testclasses/keyboardselection.spec'
import { RowDragSelectionTest } from '../testclasses/rowdragselection.spec'
import { RowResizeTest } from '../testclasses/rowresize.spec'
import { RowSelectionTest } from '../testclasses/rowselection.spec'

export class CtrlSelectionTest {
  private page: Page;
  constructor(page: Page) {
    this.page = page;

  }
  async test() {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');

    const columndragselection : ColumnDragSelectionTest = new ColumnDragSelectionTest(this.page);
    const columnselection: ColumnSelectionTest = new ColumnSelectionTest(this.page);
    const rowdragselection: RowDragSelectionTest = new RowDragSelectionTest(this.page);
    const rowselection: RowSelectionTest = new RowSelectionTest(this.page);

    await this.page.keyboard.down('Control');
    await this.page.locator('#canvas').click({ position: { x: 374, y: 108 } });
    await this.page.waitForTimeout(1000);

    await columndragselection.test()
    await columnselection.test()
    await rowdragselection.test()
    await rowselection.test()
    
    await this.page.waitForTimeout(1000);
    await this.page.mouse.move(287, 431);
    await this.page.mouse.down();
    await this.page.mouse.move(387, 631, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(3000);
  }
}

