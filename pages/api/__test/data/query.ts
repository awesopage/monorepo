import type { NextApiHandler } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { createApiRouter, sendApiResponse } from 'pkg-app-api/src/common/RouterUtils'

type TestDataQuery = Readonly<{
  model: string
  where?: object
}>

const testDataQueryApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    const { model, where } = req.body as TestDataQuery

    if (!(model in prismaClient)) {
      throw new Error(`Unknown model: ${model}`)
    }

    const modelClient = prismaClient[model as keyof typeof prismaClient]

    if (!('findMany' in modelClient) || typeof modelClient.findMany !== 'function') {
      throw new Error(`Model ${model} does not have findMany()`)
    }

    const data = await modelClient.findMany({ where })

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
