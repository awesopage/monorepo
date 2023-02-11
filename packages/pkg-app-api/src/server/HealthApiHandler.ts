import type { NextApiRequest, NextApiResponse } from 'next'

import { getDbClient } from 'pkg-app-api/src/common/DbClient'
import { checkDatabaseHealth } from 'pkg-app-api/src/server/HealthService'
import type { HealthStatusDTO } from 'pkg-app-shared/src/server/HealthStatusDTO'

export const healthApiHandler = async (req: NextApiRequest, res: NextApiResponse<HealthStatusDTO>) => {
  const database = await checkDatabaseHealth(getDbClient())
  const ok = database

  const healthStatus: HealthStatusDTO = {
    ok,
    database,
  }

  res.status(ok ? 200 : 500).json(healthStatus)
}
