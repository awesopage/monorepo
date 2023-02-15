import type { NextApiHandler } from 'next'

import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { testDataManager } from 'tests/data/TestDataManager'

const testDataQueryApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    const { model, where } = req.body as Readonly<{
      model: string
      where?: object
    }>

    const data = await testDataManager.query(model, where)

    sendApiResponse(
      res,
      // Handle types that are not supported by JSON
      JSON.parse(
        JSON.stringify(data, (key, value) => {
          return typeof value === 'bigint' ? value.toString() : value
        }),
      ),
    )
  })
  .handler()

export default testDataQueryApiHandler
