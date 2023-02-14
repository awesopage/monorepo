import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { createApiRouter } from 'pkg-app-api/src/common/RouterUtils'
import { checkDatabaseHealth } from 'pkg-app-api/src/server/HealthService'
import type { HealthStatusDTO } from 'pkg-app-shared/src/server/HealthStatusDTO'

export const healthApiHandler: NextApiHandler = createApiRouter()
  .get(async (req, res: NextApiResponse<HealthStatusDTO>) => {
    const database = await checkDatabaseHealth(prismaClient)
    const ok = database

    const healthStatus: HealthStatusDTO = {
      ok,
      database,
    }

    res.status(ok ? 200 : 500).json(healthStatus)
  })
  .handler()
