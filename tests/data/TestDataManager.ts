import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { createTestUsers } from 'tests/data/TestUsers'

export const testDataManager = {
  query: async (model: string, where?: object) => {
    if (!(model in prismaClient)) {
      throw new Error(`Unknown model: ${model}`)
    }

    const modelClient = prismaClient[model as keyof typeof prismaClient]

    if (!('findMany' in modelClient) || typeof modelClient.findMany !== 'function') {
      throw new Error(`Model ${model} does not have findMany()`)
    }

    const data = await modelClient.findMany({ where })

    return data
  },
  reset: async () => {
    await truncateAllTables()
    await createTestUsers()
  },
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
