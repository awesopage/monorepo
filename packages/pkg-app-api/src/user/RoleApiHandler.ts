import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { checkSignedIn, createApiRouter, requireCurrentUser } from 'pkg-app-api/src/router/ApiRouter'
import { mapUserToDTO } from 'pkg-app-api/src/user/UserMapper'
import { assignUserRoles } from 'pkg-app-api/src/user/UserService'
import type { User } from 'pkg-app-model/client'
import type { AssignUserRolesOptionsDTO } from 'pkg-app-shared/src/user/RoleApiOptions'
import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'

export const rolesApiHandler: NextApiHandler = createApiRouter()
  .use(checkSignedIn())
  .post(async (req, res: NextApiResponse<UserDTO>) => {
    const { email, roles } = req.body as AssignUserRolesOptionsDTO
    const currentUser = requireCurrentUser(req)

    const user: User = await prismaClient.$transaction((dbClient) => {
      return assignUserRoles(dbClient, {
        email,
        roles,
        assignedByUser: currentUser,
      })
    })

    sendApiResponse(res, mapUserToDTO(user))
  })
  .handler()
