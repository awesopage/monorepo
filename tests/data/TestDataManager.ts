import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { createTestUsers } from 'tests/data/TestUsers'

export const resetTestData = async () => {
  await truncateAllTables()
  await createTestUsers()
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
