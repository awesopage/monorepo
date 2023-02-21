import 'scripts/lib/dotenv-loader.js'

import wretch from 'wretch'

import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { waitFor } from 'scripts/lib/script-utils'

const resetTestData = async () => {
  await waitFor('Waiting for application to be ready...', 5, async () => {
    await wretch(process.env.INTERNAL_APP_BASE_URL).get('/api/server/health').res()

    return true
  })

  await wretch(process.env.INTERNAL_APP_BASE_URL).post({}, '/api/__test/data/reset').res()
}

if (isMainModule(import.meta.url)) {
  runScript(resetTestData)
}
