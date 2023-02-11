import type { DbClient } from 'pkg-app-api/src/common/DbClient'
import { createLogger, formatError } from 'pkg-app-api/src/common/LoggingUtils'

const logger = createLogger('HealthService')

export const checkDatabaseHealth = async (dbClient: DbClient): Promise<boolean> => {
  try {
    // https://github.com/prisma/prisma/issues/13264
    await dbClient.$queryRawUnsafe('SELECT 1')
    return true
  } catch (err) {
    logger.error(`Database is not healthy: ${formatError(err as Error)}`)

    return false
  }
}
