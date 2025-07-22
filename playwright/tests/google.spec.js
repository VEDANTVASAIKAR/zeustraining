import {test,expect} from '@playwright/test'


test('Verify application',async function({page})  {

    await page.goto('https://www.google.com')

    const url = await page.url()

    console.log(url)
    const title = await page.title()

    expect(title).toBe('Google')
})