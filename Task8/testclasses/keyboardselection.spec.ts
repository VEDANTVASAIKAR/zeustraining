import { test, expect, Page } from '@playwright/test';
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';


export class KeyboardSelectionTest {
  private page: Page;
  down :number 
  up : number
  left :number
  right :number
  constructor(page: Page) {
    this.page = page;
  }
  async test(down :number =5, up : number=0 ,left :number=0,right :number=4) {
    this.down = down;
    this.up = up ;
    this.right = right;
    this.left = left;
    // await this.page.goto('http://127.0.0.1:5500/Task8/index.html');
    // await this.page.locator('#canvas').click({ position: { x: 603, y: 212 } });
    // await this.page.locator('#cellInput').fill('1');
  
    await this.page.locator('#canvas').click({ position: { x: 637, y: 209 } });

    for (let i =0 ; i < down; i++){
      await this.page.locator('#canvas').press('Shift+ArrowDown');
    }
    for (let i =0 ; i < right; i++){
      await this.page.locator('#canvas').press('Shift+ArrowRight');
    }
    
    await this.page.waitForTimeout(3000)
  }
  async verifytest(nrows:number =1000,ncols :number = 500){

    // Calculate total row movement
    const rowMovement = Math.abs(this.down - this.up); // Vertical movement
    const colMovement = Math.abs(this.right - this.left); // Horizontal movement

    // Final selection is a rectangle from start to end
    const totalrowmovement = rowMovement + 1;
    const totalcolmovement = colMovement + 1;

    const actual= totalcolmovement * totalrowmovement
 
    await this.page.locator('//button[@id="count"]').click()

    const output = await this.page.evaluate(() => {
        const outputEle = document.getElementById('output')as HTMLInputElement;
        return outputEle?.value;
    });

    
    await this.page.waitForTimeout(3000);
    expect(actual).toBe(Number(output));

  }
}
