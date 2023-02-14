import type { NextApiHandler } from 'next'

import { createApiRouter, sendApiResponse } from 'pkg-app-api/src/common/RouterUtils'
import { resetTestData } from 'tests/common/TestDataManager'

const testDataSeedApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    await resetTestData()

    sendApiResponse(res, {})
  })
  .handler()

export default testDataSeedApiHandler
