import 'scripts/lib/dotenv-loader.js'

import wretch from 'wretch'

import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { waitFor } from 'scripts/lib/script-utils'
import { testDataApi } from 'tests/common/TestUtils'

const resetTestData = async () => {
  await waitFor('Waiting for application to be ready...', 5, async () => {
    await wretch(process.env.INTERNAL_APP_BASE_URL).get('/api/server/health').res()

    return true
  })

  await testDataApi.post({}, '/reset').res()
}

if (isMainModule(import.meta.url)) {
  runScript(resetTestData)
}
