import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { requireListOwnerAndRepo } from 'pkg-app-api/src/list/ListApiHelper'
import { mapListDetailsToDTO, mapListToDTO } from 'pkg-app-api/src/list/ListMapper'
import type { ListDetails } from 'pkg-app-api/src/list/ListService'
import { findListByOwnerAndRepo, updateList } from 'pkg-app-api/src/list/ListService'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { checkSignedIn, createApiRouter, requireCurrentUser } from 'pkg-app-api/src/router/ApiRouter'
import type { List } from 'pkg-app-model/client'
import type { UpdateListOptionsDTO } from 'pkg-app-shared/src/list/ListApiOptions'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'

export const listByKeyApiHandler: NextApiHandler = createApiRouter()
  .get(async (req, res: NextApiResponse<ListDTO>) => {
    const { owner, repo } = requireListOwnerAndRepo(req)

    const listDetails: ListDetails = await findListByOwnerAndRepo(prismaClient, { owner, repo })

    sendApiResponse(res, mapListDetailsToDTO(listDetails))
  })
  .use(checkSignedIn())
  .patch(async (req, res: NextApiResponse<ListDTO>) => {
    const { description, starCount, tags } = req.body as UpdateListOptionsDTO
    const currentUser = requireCurrentUser(req)
    const { owner, repo } = requireListOwnerAndRepo(req)

    const list: List = await prismaClient.$transaction((dbClient) => {
      return updateList(dbClient, {
        owner,
        repo,
        description,
        starCount,
        tags,
        updatedByUser: currentUser,
      })
    })

    sendApiResponse(res, mapListToDTO(list))
  })
  .handler()
