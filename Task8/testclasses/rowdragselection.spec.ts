import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class RowDragSelectionTest {
  private page: Page;
  starty : number;
  endy : number;
  constructor(page: Page) {
    this.page = page;
  }
  async test(starty : number = 106,endy :number = 286) {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    this.starty = 106;
    this.endy = 286
    await this.page.mouse.move(10, starty);
    await this.page.mouse.down();
    await this.page.mouse.move(10, endy, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(2000);
  }
  async verifytest(nrows:number =1000,ncols :number = 500){
    const drag :number = this.endy - this.starty;
    const colsselected : number = Math.floor(drag /25)+1

    const actual : number = (ncols -1) * colsselected
    console.log((actual));
    
    
    await this.page.locator('//button[@id="count"]').click()

    const output = await this.page.evaluate(() => {
        const outputEle = document.getElementById('output')as HTMLInputElement;
        return outputEle?.value;
    });

    
    await this.page.waitForTimeout(3000);
    expect(actual).toBe(Number(output));

  }
}
