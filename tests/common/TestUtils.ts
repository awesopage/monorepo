import assert from 'node:assert'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

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
      assert.ok(process.env.LOCAL_WORKSPACE_PATH)
      assert.ok(process.env.DATABASE_WRITE_LOG_PATH)

      const writeLogPath = path.join(process.env.LOCAL_WORKSPACE_PATH, process.env.DATABASE_WRITE_LOG_PATH)

      const isDatabaseDirty = fs.existsSync(writeLogPath)

      if (isDatabaseDirty) {
        console.log()
        console.log('Resetting test data...')
        console.log()

        await testDataApi.post({}, '/seed').res()

        await fsp.rm(writeLogPath)
      } else {
        console.log()
        console.log('No write operation, can reuse current data')
        console.log()
      }

      await use()
    },
    { auto: true },
  ],
})

export const queryTestData = async (model: string, where?: object): Promise<object[]> => {
  const data = await testDataApi.post({ model, where }, '/query').json<object[]>()

  return data
}
