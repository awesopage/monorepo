import { withIronSessionApiRoute } from 'iron-session/next'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextHandler } from 'next-connect'
import { createRouter } from 'next-connect'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { createLogger } from 'pkg-app-api/src/common/LoggingUtils'
import { sendApiError } from 'pkg-app-api/src/router/ApiResponse'
import { findUserByEmail } from 'pkg-app-api/src/user/UserService'
import type { User } from 'pkg-app-model/client'
import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'

const logger = createLogger('ApiRouter')

// Declare email in session data by module augmentation
declare module 'iron-session' {
  interface IronSessionData {
    email?: string
  }
}

export const checkSignedIn = () => {
  return async (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    const reqWithUser = req as NextApiRequest & { currentUser?: User }
    const { email } = reqWithUser.session

    if (!email) {
      logger.debug(`Session does not have email`)

      return sendApiError(res, 'UNAUTHORIZED')
    }

    const user: User = await prismaClient.$transaction((dbClient) => {
      return findUserByEmail(dbClient, email)
    })

    reqWithUser.currentUser = user

    return next()
  }
}

export const requireCurrentUser = (req: NextApiRequest): User => {
  const { currentUser } = req as NextApiRequest & { currentUser: User }

  if (!currentUser) {
    throw new Error('Request does not have user')
  }

  return currentUser
}

export const createApiRouter = () => {
  const router = createRouter<NextApiRequest, NextApiResponse>()

  // next-connect v1 does not allow to set default handler when creating router
  // so need to work around based on https://github.com/hoangvvo/next-connect/issues/201
  // and https://github.com/hoangvvo/next-connect/blob/main/src/node.ts

  const defaultHandler = router.handler.bind(router)

  router.handler = () => {
    assertDefined(process.env.APP_SESSION_SECRET, 'APP_SESSION_SECRET')

    const extendedHandler = withIronSessionApiRoute(
      defaultHandler({
        onError: (err, req, res: NextApiResponse) => {
          sendApiError(res, 'INTERNAL_SERVER_ERROR', err as Error)
        },
        onNoMatch: (req, res: NextApiResponse) => {
          sendApiError(res, 'ROUTE_HANDLER_NOT_FOUND')
        },
      }),
      {
        password: process.env.APP_SESSION_SECRET,
        cookieName: 'app-session',
        cookieOptions: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      },
    )

    return async (req, res) => {
      await extendedHandler(req, res)
    }
  }

  return router
}
