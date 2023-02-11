import type { LevelWithSilent, Logger } from 'pino'
import pino from 'pino'
import pinoPretty from 'pino-pretty'

export const createLogger = (caller: string, level?: LevelWithSilent): Logger => {
  const isProduction = process.env.NODE_ENV === 'production'
  const defaultLevel = process.env.APP_SILENT_LOGGER === 'true' ? 'silent' : isProduction ? 'info' : 'debug'
  const baseLogger = pino(
    { level: level ?? defaultLevel },
    isProduction ? undefined : pinoPretty({ ignore: 'pid,hostname' }),
  )

  return baseLogger.child({ caller })
}

export const formatError = (err: Error): string => {
  return err.stack ?? err.message
}
