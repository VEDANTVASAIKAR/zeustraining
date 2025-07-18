const {test,expect} = require("@playwright/test")

test('hover',async function({page}){

    await page.goto("https://freelance-learn-automation.vercel.app/login")

    await page.getByPlaceholder('Enter email').fill("admin@email.com")

    await page.getByPlaceholder('Enter Password').fill('admin@123')

    await page.locator('//*[@id="login_container"]/form/div/button').click()

    await page.locator('//*[@id="root"]/div/nav/div/div[2]/div[1]/span').hover()

    await page.locator('//*[@id="root"]/div/nav/div/div[2]/div[1]/div/a[1]').click()

    await page.waitForTimeout(4000)
})