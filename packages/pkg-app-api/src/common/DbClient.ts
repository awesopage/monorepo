import fsp from 'node:fs/promises'
import path from 'node:path'

import { createLogger } from 'pkg-app-api/src/common/LoggingUtils'
import type { Prisma } from 'pkg-app-model/client'
import { PrismaClient } from 'pkg-app-model/client'
import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'

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

const logOperation = async (model: string, operation: string, logPath: string) => {
  try {
    await fsp.appendFile(logPath, `${model}.${operation}\n`)
  } catch (err) {
    console.log(err)

    throw err
  }
}

type ConfiguredPrismaClient = Omit<PrismaClient, '$use'>

const createPrismaClient = (): ConfiguredPrismaClient => {
  const databaseUrl = process.env.DATABASE_URL

  const baseClient: PrismaClient<Prisma.PrismaClientOptions, 'info' | 'warn' | 'error' | 'query'> = new PrismaClient({
    datasources: {
      ...(databaseUrl ? { db: { url: databaseUrl } } : {}),
    },
    log: getLogConfig(),
  })

  baseClient.$on('query', (queryEvent) => {
    const params = queryEvent.params.substring(0, 500)

    logger.debug(`Query ${queryEvent.query} with params ${params} took ${queryEvent.duration}ms.`)
  })
  baseClient.$on('info', (logEvent) => {
    logger.info(logEvent.message)
  })
  baseClient.$on('warn', (logEvent) => {
    logger.warn(logEvent.message)
  })
  baseClient.$on('error', (logEvent) => {
    logger.error(logEvent.message)
  })

  if (process.env.DATABASE_OPERATION_LOG_PATH) {
    assertDefined(process.env.LOCAL_WORKSPACE_PATH, 'LOCAL_WORKSPACE_PATH')

    const operationLogPath = path.join(process.env.LOCAL_WORKSPACE_PATH, process.env.DATABASE_OPERATION_LOG_PATH)
    console.log(`Logging operations to ${operationLogPath}...`)

    return baseClient.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args, query }) => {
            await logOperation(model, operation, operationLogPath)

            return query(args)
          },
        },
      },
    })
  }

  return baseClient
}

// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalThisAny = globalThis as any
const prismaClient: ConfiguredPrismaClient = globalThisAny.singlePrismaClient ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThisAny.singlePrismaClient = prismaClient
}

export { prismaClient }
