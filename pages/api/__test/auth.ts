import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { mapUserToDTO } from 'pkg-app-api/src/user/UserMapper'
import { findOrCreateUser } from 'pkg-app-api/src/user/UserService'
import type { User } from 'pkg-app-model/client'
import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'

const testAuthApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res: NextApiResponse<UserDTO>) => {
    const { email, displayName } = req.body as Readonly<{
      email: string
      displayName?: string
    }>

    const user: User = await prismaClient.$transaction((dbClient) => {
      return findOrCreateUser(dbClient, { email, displayName })
    })

    req.session.email = user.email

    await req.session.save()

    sendApiResponse(res, mapUserToDTO(user))
  })
  .handler()

export default testAuthApiHandler
