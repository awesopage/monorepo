import { expect as baseExpect, test as baseTest } from 'playwright-test-coverage'
import wretch from 'wretch'

export const expect = baseExpect

type CustomFixtures = Readonly<{
  resetDatabase: void
}>

export const test = baseTest.extend<CustomFixtures>({
  resetDatabase: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      console.log('Resetting test data...')

      await wretch(process.env.NEXT_PUBLIC_APP_BASE_URL).post({}, '/api/__test/data/seed').res()

      await use()
    },
    { auto: true },
  ],
})

export const queryTestData = async (model: string, where?: object): Promise<object[]> => {
  // Do not call TestDataManager directly due to Playwright resolves ESM imports differently
  const data = await wretch(process.env.NEXT_PUBLIC_APP_BASE_URL)
    .post({ model, where }, '/api/__test/data/query')
    .json<object[]>()

  return data
}
