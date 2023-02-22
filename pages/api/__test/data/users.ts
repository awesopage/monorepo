import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { mapUserToDTO } from 'pkg-app-api/src/user/UserMapper'
import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'

const testDataUsersApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res: NextApiResponse<UserDTO[]>) => {
    const { email } = req.body as Readonly<{
      email?: string
    }>

    const users = await prismaClient.$transaction((dbClient) => {
      return dbClient.user.findMany({
        where: { email },
      })
    })

    sendApiResponse(res, users.map(mapUserToDTO))
  })
  .handler()

export default testDataUsersApiHandler
