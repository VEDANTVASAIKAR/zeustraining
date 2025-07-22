import {test,expect} from '@playwright/test'

test('valid login', async function({ page })  {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')

    await page.getByPlaceholder('Username').pressSequentially('Admin')

    await page.getByPlaceholder('Password').fill('admin123')

    await page.locator('//*[@id="app"]/div[1]/div/div[1]/div/div[2]/div[2]/form/div[3]/button').click()

    await page.waitForTimeout(5000)

    await expect(page).toHaveURL(/dashboard/)

    await page.locator('//*[@id="app"]/div[1]/div[1]/header/div[1]/div[3]/ul/li/span/img').click()

    await page.locator('//*[@id="app"]/div[1]/div[1]/header/div[1]/div[3]/ul/li/ul/li[4]/a').click()

    await page.waitForTimeout(5000)

    await expect(page).toHaveURL(/login/)

})