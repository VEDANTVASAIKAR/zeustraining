import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class ColumnDragSelectionTest {
  private page: Page;
  startx : number;
  endx : number
  constructor(page: Page) {
    this.page = page;
  }
  async test(startx:number = 570, endx :number=870) {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    this.startx = startx;
    this.endx = endx;
    await this.page.mouse.move(570, 56);
    await this.page.mouse.down();
    await this.page.mouse.move(870, 56, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(2000);
  }

  async verifytest(nrows:number =1000,ncols :number = 500){
    const drag :number = this.endx - this.startx;
    const colsselected : number = Math.floor(drag /100)+1

    const actual : number = (nrows -1) * colsselected

    
    await this.page.locator('//button[@id="count"]').click()

    const output = await this.page.evaluate(() => {
        const outputEle = document.getElementById('output')as HTMLInputElement;
        return outputEle?.value;
    });

    
    await this.page.waitForTimeout(3000);
    expect(actual).toBe(Number(output));

  }
  
}