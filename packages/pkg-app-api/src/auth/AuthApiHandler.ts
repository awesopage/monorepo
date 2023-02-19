import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { mapUserToDTO } from 'pkg-app-api/src/user/UserMapper'
import { findUserByEmail } from 'pkg-app-api/src/user/UserService'
import type { User } from 'pkg-app-model/client'
import type { AuthMeDTO } from 'pkg-app-shared/src/auth/AuthMeDTO'
import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'

export const authMeApiHandler: NextApiHandler = createApiRouter()
  // Do not use checkSignedIn to send empty response instead of UNAUTHORIZED error when not signed in
  .get(async (req, res: NextApiResponse<AuthMeDTO>) => {
    try {
      const { email } = req.session

      assertDefined(email, 'email')

      const currentUser: User = await prismaClient.$transaction((dbClient) => {
        return findUserByEmail(dbClient, email)
      })

      sendApiResponse(res, { user: mapUserToDTO(currentUser) })
    } catch {
      sendApiResponse(res, {})
    }
  })
  .handler()
