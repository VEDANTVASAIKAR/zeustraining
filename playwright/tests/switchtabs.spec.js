import {test,expect} from '@playwright/test'

test('switchtabs',async ({browser})=>{
    
    const context =await browser.newContext()

    const page =await context.newPage();

    await page.goto('https://freelance-learn-automation.vercel.app/login')

    const [newPage] = await Promise.all(
        [
            context.waitForEvent('page'),
            page.locator('//*[@id="login_container"]/div/div/a[4]').click()
        ]
    )

    await newPage.locator('//*[@id="_r_9_"]').fill('vedantvasaikar@gmail.com')
    await newPage.waitForTimeout(2000)

    await newPage.close()

    await page.locator('//*[@id="email1"]').fill('admin@email.com')

    await page.waitForTimeout(2000)
})