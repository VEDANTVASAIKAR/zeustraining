const {test,expect} = require("@playwright/test")

test('alert',async function({page}){

    await page.goto("https://testpages.herokuapp.com/styled/alerts/alert-test.html")

    //add before clicking always
    page.on('dialog', async (d)=>{
        expect(d.type()).toContain("alert")
        expect(d.message()).toContain("I am an alert box!")
        await d.accept()
    })

    await page.locator('//*[@id="alertexamples"]').click()


})

test('confirm',async function({page}){

    await page.goto("https://testpages.herokuapp.com/styled/alerts/alert-test.html")
    
    //add before clicking always
    page.on('dialog', async (d)=>{
        expect(d.type()).toContain("confirm")
        expect(d.message()).toContain("I am a confirm alert")
        // await d.accept()
        await d.dismiss()

    })

    await page.locator('//*[@id="confirmexample"]').click()

    expect(await page.locator('//*[@id="confirmexplanation"]')).toContainText('You clicked Cancel,')

})

test('prompt',async function({page}){

    await page.goto("https://testpages.herokuapp.com/styled/alerts/alert-test.html")
    
    //add before clicking always
    page.on('dialog', async (d)=>{
        expect(d.type()).toContain("prompt")
        expect(d.message()).toContain("I prompt you")
        // await d.accept()
        // await d.dismiss()
        await d.accept("Vedant")

    })

    await page.locator('//*[@id="promptexample"]').click()

    await page.waitForTimeout(3000)

})