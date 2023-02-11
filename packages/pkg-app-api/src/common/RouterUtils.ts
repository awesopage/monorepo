import type { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

import { createLogger, formatError } from 'pkg-app-api/src/common/LoggingUtils'
import type { ApiErrorDTO, ApiErrorType } from 'pkg-app-shared/src/common/ApiErrorDTO'

const logger = createLogger('RouterUtils')

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

export const createApiRouter = () => {
  const router = createRouter<NextApiRequest, NextApiResponse>()

  // next-connect v1 does not allow to set default handler when creating router
  // so need to work around based on https://github.com/hoangvvo/next-connect/issues/201
  // and https://github.com/hoangvvo/next-connect/blob/main/src/node.ts

  const defaultHandler = router.handler.bind(router)

  router.handler = () => {
    const extendedHandler = defaultHandler({
      onError: (err, req, res: NextApiResponse) => {
        sendApiError(res, 'INTERNAL_SERVER_ERROR', err as Error)
      },
      onNoMatch: (req, res: NextApiResponse) => {
        sendApiError(res, 'ROUTE_HANDLER_NOT_FOUND')
      },
    })

    return async (req, res) => {
      await extendedHandler(req, res)
    }
  }

  return router
}
