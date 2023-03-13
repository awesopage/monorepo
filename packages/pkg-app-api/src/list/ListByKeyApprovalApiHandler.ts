import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { requireListOwnerAndRepo } from 'pkg-app-api/src/list/ListApiHelper'
import { mapListToDTO } from 'pkg-app-api/src/list/ListMapper'
import { approveList } from 'pkg-app-api/src/list/ListService'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { checkSignedIn, createApiRouter, requireCurrentUser } from 'pkg-app-api/src/router/ApiRouter'
import type { List } from 'pkg-app-model/client'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'

export const listByKeyApprovalApiHandler: NextApiHandler = createApiRouter()
  .use(checkSignedIn())
  .post(async (req, res: NextApiResponse<ListDTO>) => {
    const currentUser = requireCurrentUser(req)
    const { owner, repo } = requireListOwnerAndRepo(req)

    const list: List = await prismaClient.$transaction((dbClient) => {
      return approveList(dbClient, {
        owner,
        repo,
        approvedByUser: currentUser,
      })
    })

    sendApiResponse(res, mapListToDTO(list))
  })
  .handler()
