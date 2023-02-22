import type { NextApiHandler } from 'next'

import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { resetTestData } from 'tests/data/TestDataManager'

const testDataResetApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    await resetTestData()

    sendApiResponse(res, {})
  })
  .handler()

export default testDataResetApiHandler
