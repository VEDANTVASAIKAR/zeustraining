const {test,expect} = require('@playwright/test')
const { log } = require('console')

test('Verify application',async function({page})  {

    await page.goto('https://www.google.com')

    const url = await page.url()

    console.log(url)
    const title = await page.title()

    expect(title).toBe('Google')
})