import 'scripts/lib/dotenv-loader.js'

import assert from 'node:assert'
import fsp from 'node:fs/promises'
import path from 'node:path'

import wretch from 'wretch'

import { runCommand, waitFor } from 'scripts/lib/script-utils'

const globalSetup = async () => {
  await waitFor('Waiting for application to be ready...', 5, async () => {
    await wretch(process.env.INTERNAL_APP_BASE_URL).get('/api/server/health').res()

    return true
  })

  console.log()
  console.log('Creating test data...')
  console.log()

  assert.ok(process.env.LOCAL_WORKSPACE_PATH)
  assert.ok(process.env.DATABASE_WRITE_LOG_PATH)

  const writeLogPath = path.join(process.env.LOCAL_WORKSPACE_PATH, process.env.DATABASE_WRITE_LOG_PATH)

  await runCommand('npm', ['run', 'model-schema', 'seed'])

  await fsp.rm(writeLogPath)
}

export default globalSetup
