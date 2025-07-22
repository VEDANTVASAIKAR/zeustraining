// import { test, expect, Page } from '@playwright/test';
// import { cols } from '../scripts/script';
// import { rows } from '../scripts/script';
// import { Cols } from '../scripts/cols';

// export class ColumnResizeTest {
//   private page: Page;
//   private startx : number;
//   private endx : number;
//   constructor(page: Page) {
//     this.page = page;
//   }
//   async test(startx:number=550,starty :number =56,endx:number=840,endy : number =56) {
//     // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
//     this.startx =startx
//     this.endx = endx
//     await this.page.mouse.move(startx, starty);
//     await this.page.mouse.down();
//     await this.page.mouse.move(endx, endy, { steps: 5 });
//     await this.page.mouse.up();
//     await this.page.waitForTimeout(4000);
//   }

//   async verifytest(){
//     const index = (this.startx - 50)/100
//     const resizeval = this.endx - this.startx 
//     const actual = cols.getWidth(index);
//     return actual === 100+resizeval
//   }
// }
import { test, expect, Page } from '@playwright/test';

export class ColumnResizeTest {
  private page: Page;
  private startx: number;
  private endx: number;

  constructor(page: Page) {
    this.page = page;
  }

  async test(
    startx: number = 550,
    starty: number = 56,
    endx: number = 840,
    endy: number = 56
  ) {
    this.startx = startx;
    this.endx = endx;
    await this.page.mouse.move(startx, starty);
    await this.page.mouse.down();
    await this.page.mouse.move(endx, endy, { steps: 5 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(4000);
  }

  async verifytest() {
    const index = Math.floor((this.startx - 50) / 100);
    const resizeval = this.endx - this.startx;
    // Evaluate in the browser context, not by using import
    const actual = await this.page.evaluate((colIdx: number) => {
      // @ts-ignore
      return window.cols.getWidth(colIdx);
    }, index);
    // return actual === 100 + resizeval;
    expect(actual).toBeCloseTo(100 + resizeval, 2);
  }
}
