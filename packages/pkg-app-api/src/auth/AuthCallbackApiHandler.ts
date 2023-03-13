import type { NextApiHandler } from 'next'

import { verifyAuthInfo } from 'pkg-app-api/src/auth/AuthService'
import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { createLogger, formatError } from 'pkg-app-api/src/common/LoggingUtils'
import { redirectApiResponse, sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { mapUserToDTO } from 'pkg-app-api/src/user/UserMapper'
import { findOrCreateUser } from 'pkg-app-api/src/user/UserService'
import type { User } from 'pkg-app-model/client'
import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'
import { getQueryValue } from 'pkg-app-shared/src/common/QueryUtils'

const logger = createLogger('AuthCallbackApiHandler')

export const authCallbackApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    assertDefined(process.env.NEXT_PUBLIC_APP_BASE_URL, 'NEXT_PUBLIC_APP_BASE_URL')

    try {
      const token = getQueryValue(req.query.token)

      assertDefined(token, 'token')

      const { email, displayName, returnUrl } = await verifyAuthInfo(token)

      const user: User = await prismaClient.$transaction((dbClient) => {
        return findOrCreateUser(dbClient, { email, displayName })
      })

      req.session.email = user.email

      await req.session.save()

      if (typeof returnUrl === 'undefined') {
        return sendApiResponse(res, mapUserToDTO(user))
      }

      redirectApiResponse(res, returnUrl)
    } catch (err) {
      logger.debug(`Authentication error: ${formatError(err as Error)}`)

      redirectApiResponse(res, `${process.env.NEXT_PUBLIC_APP_BASE_URL}/auth-error`)
    }
  })
  .handler()
