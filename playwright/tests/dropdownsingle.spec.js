const { log } = require('console')
const {test,expect} = require('playwright/test')

test('select singlevalue',async function ({page}) 
{
    //label/value/index/  

    await page.goto("https://freelance-learn-automation.vercel.app/signup")
    
    await page.locator('#state').selectOption({label : 'Goa'})
    await page.waitForTimeout(2000)

    let state = await page.$('#state')

    let asllelements = await state.$$('option')

    for(let i=0;i<asllelements.length;i++){
        let element = asllelements[i]
        let value = await element.textContent()
        console.log('value from dropdown'+value)
    }

    await page.locator('#hobbies').selectOption(['Playing','Swimming'])

    await page.waitForTimeout(4000)
})