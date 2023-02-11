import type { DbClient } from 'pkg-app-api/src/common/DbClient'

export const checkDatabaseHealth = async (dbClient: DbClient): Promise<boolean> => {
  try {
    // https://github.com/prisma/prisma/issues/13264
    await dbClient.$queryRawUnsafe('SELECT 1')
    return true
  } catch {
    return false
  }
}
