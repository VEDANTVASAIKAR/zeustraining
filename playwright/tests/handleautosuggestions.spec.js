import {test,expect} from '@playwright/test'

// test('autosuggestion',async ({page})=>{
    
//     await page.goto('https://www.google.com')

//     await page.locator('//*[@id="APjFqb"]').focus()

//     await page.keyboard.type("Mukesh Otwani!")

//     // await page.waitForTimeout(2000)

//     await page.waitForSelector('//*[@id="Alh6id"]/div[1]/div/ul/li[7]')

//     await page.keyboard.press('ArrowDown')

//     await page.keyboard.press('ArrowDown')

//     await page.keyboard.press('ArrowDown')

//     await page.keyboard.press('Enter')

//     await page.waitForTimeout(2000)
// })

test('autosuggestion',async ({page})=>{
    
    await page.goto('https://www.google.com')

    await page.locator('//*[@id="APjFqb"]').focus()

    await page.keyboard.type("Mukesh Otwani!")

    // await page.waitForTimeout(2000)

    await page.waitForSelector('//li[@role="presentation"]')

    const element = await page.$$('//li[@role="presentation"]')

    for(let i=0;i<element.length;i++){
        const text = await element[i].textContent()

        if(text.includes('youtube')){
            await element[i].click()
            break;
        }

    }

    

    await page.waitForTimeout(2000)
})