import type { NextApiHandler } from 'next'

import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { testDataManager } from 'tests/data/TestDataManager'

const testDataSeedApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    await testDataManager.reset()

    sendApiResponse(res, {})
  })
  .handler()

export default testDataSeedApiHandler
