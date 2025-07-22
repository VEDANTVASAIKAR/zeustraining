import {test,expect} from '@playwright/test'

test('My first test',async function({page})  {

    expect(12).toBe(12)
})

test('My second test',async function({page})  {
    expect(false).toBeFalsy()
})

test('My third test',async function({page})  {
    expect(2.0).toBe(2.0)
})

test('My fourth test', async function({page})  {
    expect('vedant ').toContain('ved')
    expect(true).toBeTruthy()       
   
})