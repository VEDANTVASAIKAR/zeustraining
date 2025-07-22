import { expect } from "@playwright/test"
export class HomePage {

    constructor(page){
        this.page = page
        this.menu = '//img[@alt="menu"]'
        this.signout = '//*[@id="root"]/div/nav/div/div[2]/img'
        this.manageoptions = '//*[@id="root"]/div/nav/div/div[2]/div[1]'
    }

    async verifymanage() {
        await expect(this.page.locator(this.manageoptions)).toBeVisible()
    }

    async logout(){

        await this.page.click(this.menu)

        await this.page.click(this.signout)
        
    }

    async verifylogout(){

        await expect(this.page).toHaveURL(/login/)
    }
}