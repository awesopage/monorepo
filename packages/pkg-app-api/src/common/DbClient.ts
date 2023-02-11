import type { Prisma } from 'pkg-app-model/client'
import { PrismaClient } from 'pkg-app-model/client'

export type DbClient = Prisma.TransactionClient

// eslint-disable-next-line no-null/no-null
export const DB_NULL_VALUE = null

export const maybe = <T extends object>(record: T | typeof DB_NULL_VALUE): T | undefined => {
  return record === DB_NULL_VALUE ? undefined : record
}

const createPrismaClient = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL

  const client = new PrismaClient({
    datasources: {
      ...(databaseUrl ? { db: { url: databaseUrl } } : {}),
    },
  })

  return client
}

// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalThisAny = globalThis as any
const cachedDbClient: DbClient = globalThisAny.singlePrismaClient ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThisAny.singlePrismaClient = cachedDbClient
}

export const getDbClient = (): DbClient => {
  return cachedDbClient
}
