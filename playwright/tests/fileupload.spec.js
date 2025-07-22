import {test,expect} from '@playwright/test'

test('fileuplaod',async ({page})=>{
    
    await page.goto('https://the-internet.herokuapp.com/upload')

    await page.locator('//*[@id="file-upload"]').setInputFiles('Capture.PNG')

    await page.waitForTimeout(3000)


    await page.locator('//*[@id="file-upload"]').setInputFiles([])

    await page.waitForTimeout(3000)


    await page.locator('//*[@id="file-upload"]').setInputFiles('Capture.PNG')

    
    await page.locator('//*[@id="file-submit"]').click()

    expect( await page.locator('//*[@id="content"]/div/h3')).toHaveText("File Uploaded!")

    await page.waitForTimeout(3000)
})