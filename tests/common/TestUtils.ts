import assert from 'node:assert'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

import { expect as baseExpect, test as baseTest } from 'playwright-test-coverage'
import wretch from 'wretch'

export const expect = baseExpect

export const testDataApi = wretch(`${process.env.INTERNAL_APP_BASE_URL}/api/__test/data`)

type CustomFixtures = Readonly<{
  testData: void
}>

export const test = baseTest.extend<CustomFixtures>({
  testData: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      assert.ok(process.env.LOCAL_WORKSPACE_PATH)
      assert.ok(process.env.DATABASE_OPERATION_LOG_PATH)
      assert.ok(process.env.TEST_DATA_LOG_PATH)

      const operationLogPath = path.join(process.env.LOCAL_WORKSPACE_PATH, process.env.DATABASE_OPERATION_LOG_PATH)
      const hasOperationLog = fs.existsSync(operationLogPath)
      const operations = hasOperationLog
        ? (await fsp.readFile(operationLogPath, 'utf-8')).split(/\r?\n/).filter(Boolean)
        : []

      const writeOperationCount = operations.filter((operation) => getOperationType(operation) === 'write').length
      const readOperationCount = operations.length - writeOperationCount
      const isDatabaseDirty = writeOperationCount > 0

      if (isDatabaseDirty) {
        // Do not call resetTestData() of TestDataManager directly due to
        // Playwright resolves ESM imports differently
        await testDataApi.post({}, '/reset').res()
      }

      const testDataLogPath = path.join(process.env.LOCAL_WORKSPACE_PATH, process.env.TEST_DATA_LOG_PATH)
      const operationSummary = `${readOperationCount} reads, ${writeOperationCount} writes`
      const testName = testInfo.titlePath.slice(1).join(' > ')
      const message = [
        ...operations.map((operation) => `${operation} => ${getOperationType(operation)}`),
        '',
        `${operationSummary} => ${isDatabaseDirty ? 'reset' : 'reuse'} => ${testName}`,
        '',
      ].join('\n')

      await fsp.appendFile(testDataLogPath, message)

      if (hasOperationLog) {
        await fsp.rm(operationLogPath)
      }

      await use()
    },
    { auto: true },
  ],
})

const DB_WRITE_OPERATION_PREFIXES = ['create', 'update', 'delete', 'upsert']

const getOperationType = (operation: string): 'read' | 'write' => {
  return DB_WRITE_OPERATION_PREFIXES.some((prefix) => operation.includes(`.${prefix}`)) ? 'write' : 'read'
}

export const useTestUser = (userName: string) => {
  test.use({
    storageState: `output/test/playwright/setup/${userName}-auth-state.json`,
  })
}
