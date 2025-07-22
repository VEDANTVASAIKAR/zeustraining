import {test,expect} from '@playwright/test'
import {LoginPage} from '../pages/loginpage'
import { HomePage } from '../pages/homepage'

test('loginpm',async({page})=>{

    await page.goto('https://freelance-learn-automation.vercel.app/login')

    const loginpage = new LoginPage(page)
    await loginpage.login()
    const homepage = new HomePage(page)
    await homepage.verifymanage()
    await homepage.logout()
    await homepage.verifylogout()
})

