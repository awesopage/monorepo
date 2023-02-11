import { createLogger } from 'pkg-app-api/src/common/LoggingUtils'
import type { Prisma } from 'pkg-app-model/client'
import { PrismaClient } from 'pkg-app-model/client'

const logger = createLogger('DbClient')

export type DbClient = Prisma.TransactionClient

// eslint-disable-next-line no-null/no-null
export const DB_NULL_VALUE = null

export const maybe = <T extends object>(record: T | typeof DB_NULL_VALUE): T | undefined => {
  return record === DB_NULL_VALUE ? undefined : record
}

type LogConfig = Prisma.PrismaClientOptions['log']

const getLogConfig = (): LogConfig => {
  const queryLogConfig: LogConfig = [{ emit: 'event', level: 'query' }]

  return [
    ...(process.env.DATABASE_QUERY_DEBUG === 'true' ? queryLogConfig : []),
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ]
}

const createPrismaClient = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL

  const client: PrismaClient<Prisma.PrismaClientOptions, 'info' | 'warn' | 'error' | 'query'> = new PrismaClient({
    datasources: {
      ...(databaseUrl ? { db: { url: databaseUrl } } : {}),
    },
    log: getLogConfig(),
  })

  client.$on('query', (queryEvent) => {
    const params = queryEvent.params.substring(0, 500)

    logger.debug(`Query ${queryEvent.query} with params ${params} took ${queryEvent.duration}ms.`)
  })
  client.$on('info', (logEvent) => {
    logger.info(logEvent.message)
  })
  client.$on('warn', (logEvent) => {
    logger.warn(logEvent.message)
  })
  client.$on('error', (logEvent) => {
    logger.error(logEvent.message)
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
