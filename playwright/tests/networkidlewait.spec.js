import {test,expect} from '@playwright/test'

test('networkidlewait',async ({page})=>{

    await page.goto('https://freelance-learn-automation.vercel.app/login')

    await page.locator('//*[@id="login_container"]/form/div/a').click()


    await page.waitForLoadState('networkidle')
    const count = await page.locator("//input[@type='checkbox']").count()

    expect(count).toBe(8)
})