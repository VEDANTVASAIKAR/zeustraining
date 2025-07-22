import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';

export class RowResizeTest {
  private page: Page;
  private starty: number;
  private endy: number;
  constructor(page: Page) {
    this.page = page;
  }
  async test(
    startx: number = 5,
    starty: number = 125,
    endx: number = 5,
    endy: number = 425
  ) {
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    this.starty = starty
    this.endy = endy
    await this.page.mouse.move(startx, starty);
    await this.page.mouse.down();
    await this.page.mouse.move(endx, endy, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(4000);
  }



  async verifytest(){
    //25 cornercell and 50 heade = 75
    const index = Math.floor((this.starty-75)/25)
    const resizeval = this.endy - this.starty
    const actual = await this.page.evaluate((rowIdx: number) => {
      // @ts-ignore
      return window.rows.getHeight(rowIdx);
    }, index);

    expect(actual).toBeCloseTo(25 + resizeval, 2); // 2 = number of decimal digits
  
  }
}
