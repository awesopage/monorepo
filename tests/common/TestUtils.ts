import { expect as baseExpect, test as baseTest } from 'playwright-test-coverage'
import wretch from 'wretch'

export const expect = baseExpect

export const test = baseTest

// Do not call TestDataManager directly due to Playwright resolves ESM imports differently

export const queryTestData = async (model: string, where?: object): Promise<object[]> => {
  const data = await wretch(process.env.NEXT_PUBLIC_APP_BASE_URL)
    .post({ model, where }, '/api/__test/data/query')
    .json<object[]>()

  return data
}

export const resetTestData = async (): Promise<void> => {
  await wretch(process.env.NEXT_PUBLIC_APP_BASE_URL).post({}, '/api/__test/data/seed').res()
}
