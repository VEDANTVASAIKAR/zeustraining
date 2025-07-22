export class LoginPage
{
    constructor(page){
        this.page = page;
        this. username = '//*[@id="email1"]'
        this.password='//*[@id="password1"]'
        this.loginbutton = '//*[@id="login_container"]/form/div/button'
    }

    async login(){
        await this.page.fill(this.username,"admin@email.com")
        await this.page.waitForTimeout(3000)
        await this.page.fill(this.password,"admin@123")
        await this.page.click(this.loginbutton)
        
    }
}