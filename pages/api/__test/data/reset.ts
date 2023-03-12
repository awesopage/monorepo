import type { NextApiHandler } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { createTestLists } from 'tests/data/TestListService'
import { createTestUsers } from 'tests/data/TestUserService'

const testDataResetApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    await resetTestData()

    sendApiResponse(res, {})
  })
  .handler()

export default testDataResetApiHandler

const resetTestData = async () => {
  await truncateAllTables()
  await createTestUsers()
  await createTestLists()
}

const truncateAllTables = async (): Promise<string[]> => {
  // Based on https://www.prisma.io/docs/concepts/components/prisma-client/crud#deleting-all-data-with-raw-sql--truncate
  const tableNameResults = await prismaClient.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  )

  const tableNames = tableNameResults
    .map(({ tablename }) => tablename)
    .filter((tableName) => !tableName.startsWith('_'))

  await prismaClient.$transaction(
    tableNames.map((tableName) => {
      return prismaClient.$executeRawUnsafe(`TRUNCATE TABLE ${tableName} CASCADE`)
    }),
  )

  return tableNames
}
