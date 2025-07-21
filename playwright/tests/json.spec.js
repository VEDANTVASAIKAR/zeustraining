const {test,expect} = require("@playwright/test")
const testdata = JSON.parse(JSON.stringify(require('../testlogin.json')))

test.describe("Data Driven Login Test", ()=>{

    testdata.forEach((data, index) => {

        test.describe(`login with users ${data.username}`,()=>{

            test(`json - ${data.username} [${index}]`,async function({page}){

            await page.goto('https://freelance-learn-automation.vercel.app/login')

            await page.locator('//*[@id="email1"]').fill(data.username)

            await page.waitForTimeout(3000)

            await page.locator('//*[@id="password1"]').fill(data.password)


            // await page.locator('//*[@id="login_container"]/form/div/button').click()

        })
        })
    }
)}
)

// test('jsonnn',async function({page}){

//     await page.goto('https://freelance-learn-automation.vercel.app/login')

//     await page.locator('//*[@id="email1"]').fill(testdata.username)

//     await page.waitForTimeout(3000)

//     await page.locator('//*[@id="password1"]').fill(testdata.password)

//     await page.pause()

//     // await page.locator('//*[@id="login_container"]/form/div/button').click()



// })