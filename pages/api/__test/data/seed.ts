import type { NextApiHandler } from 'next'

import { createApiRouter, sendApiResponse } from 'pkg-app-api/src/common/RouterUtils'
import { testDataManager } from 'tests/data/TestDataManager'

const testDataSeedApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    await testDataManager.reset()

    sendApiResponse(res, {})
  })
  .handler()

export default testDataSeedApiHandler
