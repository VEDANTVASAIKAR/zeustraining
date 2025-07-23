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

  async verifytest(nrows:number =1000,ncols :number = 500){
    const actual :number = ncols-1;
    console.log(nrows);
    
    await this.page.locator('//button[@id="count"]').click()
    // const outputele = document.getElementById('output')
    // const output = outputele?.innerText
    const output = await this.page.evaluate(() => {
        const outputEle = document.getElementById('output')as HTMLInputElement;
        return outputEle?.value;
    });
    console.log(output);
    
    await this.page.waitForTimeout(3000)
    expect(actual).toBe(Number(output));


  }
}
