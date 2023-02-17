import { expect as baseExpect, test as baseTest } from 'playwright-test-coverage'
import wretch from 'wretch'

export const expect = baseExpect

// Do not call TestDataManager directly due to Playwright resolves ESM imports differently
const testDataApi = wretch(`${process.env.INTERNAL_APP_BASE_URL}/api/__test/data`)

type CustomFixtures = Readonly<{
  resetDatabase: void
}>

export const test = baseTest.extend<CustomFixtures>({
  resetDatabase: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      console.log('Resetting test data...')

      await testDataApi.post({}, '/seed').res()

      await use()
    },
    { auto: true },
  ],
})

export const queryTestData = async (model: string, where?: object): Promise<object[]> => {
  const data = await testDataApi.post({ model, where }, '/query').json<object[]>()

  return data
}
