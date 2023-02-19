import 'scripts/lib/dotenv-loader.js'

import assert from 'node:assert'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

import { request } from '@playwright/test'
import wretch from 'wretch'

import { runCommand, waitFor } from 'scripts/lib/script-utils'

// All user names from tests/data/TestUsers.ts
const TEST_USER_NAMES = ['admin1', 'admin2', 'reviewer1', 'reviewer2', 'user1', 'user2']

const collectAuthStates = async () => {
  console.log()
  console.log(`Collecting auth states for ${TEST_USER_NAMES.length} users...`)
  console.log()

  for (const testUserName of TEST_USER_NAMES) {
    const requestContext = await request.newContext()

    await requestContext.post(`${process.env.INTERNAL_APP_BASE_URL}/api/__test/auth`, {
      data: {
        email: `${testUserName}@example.com`,
      },
    })

    await requestContext.storageState({ path: `output/test/playwright/setup/${testUserName}-auth-state.json` })
    await requestContext.dispose()
  }
}

const globalSetup = async () => {
  await waitFor('Waiting for application to be ready...', 5, async () => {
    await wretch(process.env.INTERNAL_APP_BASE_URL).get('/api/server/health').res()

    return true
  })

  console.log()
  console.log('Creating test data...')
  console.log()

  assert.ok(process.env.LOCAL_WORKSPACE_PATH)
  assert.ok(process.env.DATABASE_OPERATION_LOG_PATH)
  assert.ok(process.env.TEST_DATA_LOG_PATH)

  const operationLogPath = path.join(process.env.LOCAL_WORKSPACE_PATH, process.env.DATABASE_OPERATION_LOG_PATH)
  const testDataLogPath = path.join(process.env.LOCAL_WORKSPACE_PATH, process.env.TEST_DATA_LOG_PATH)

  await fsp.mkdir(path.dirname(operationLogPath), { recursive: true })
  await fsp.mkdir(path.dirname(testDataLogPath), { recursive: true })

  await runCommand('npm', ['run', 'model-schema', 'seed'])

  await collectAuthStates()

  if (fs.existsSync(operationLogPath)) {
    await fsp.rm(operationLogPath)
  }
}

export default globalSetup
