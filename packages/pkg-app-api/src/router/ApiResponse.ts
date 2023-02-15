import type { NextApiResponse } from 'next'

import { createLogger, formatError } from 'pkg-app-api/src/common/LoggingUtils'
import type { ApiErrorDTO, ApiErrorType } from 'pkg-app-shared/src/common/ApiErrorDTO'

const logger = createLogger('ApiResponse')

const STATUS_CODE_BY_ERROR_TYPE: Partial<Record<ApiErrorType, number>> = {
  UNAUTHORIZED: 401,
  ACCESS_DENIED: 403,
  ROUTE_HANDLER_NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}

export const sendApiError = (res: NextApiResponse, type: ApiErrorType, err?: Error) => {
  const debugInfo = err && formatError(err)

  if (err) {
    logger.error(`${type}: ${debugInfo}`)
  }

  const statusCode = STATUS_CODE_BY_ERROR_TYPE[type] ?? 500

  const apiError: ApiErrorDTO = {
    type,
    details: err && 'details' in err ? err.details : undefined,
    debugInfo: process.env.NODE_ENV !== 'production' ? debugInfo : undefined,
  }

  res.status(statusCode).json(apiError)
}

export const sendApiResponse = <T>(res: NextApiResponse<T>, data: T) => {
  res.status(200).json(data)
}
