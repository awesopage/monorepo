import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { mapListToDTO } from 'pkg-app-api/src/list/ListMapper'
import { createList, findActiveLists } from 'pkg-app-api/src/list/ListService'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { checkSignedIn, createApiRouter, requireCurrentUser } from 'pkg-app-api/src/router/ApiRouter'
import type { List } from 'pkg-app-model/client'
import type { CreateListOptionsDTO } from 'pkg-app-shared/src/list/ListApiOptions'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'

export const listsApiHandler: NextApiHandler = createApiRouter()
  .get(async (req, res: NextApiResponse<ListDTO[]>) => {
    const lists: List[] = await prismaClient.$transaction((dbClient) => {
      return findActiveLists(dbClient)
    })

    sendApiResponse(res, lists.map(mapListToDTO))
  })
  .use(checkSignedIn())
  .post(async (req, res: NextApiResponse<ListDTO>) => {
    const { owner, repo } = req.body as CreateListOptionsDTO
    const currentUser = requireCurrentUser(req)

    const list: List = await prismaClient.$transaction((dbClient) => {
      return createList(dbClient, {
        owner,
        repo,
        requestedByUser: currentUser,
      })
    })

    sendApiResponse(res, mapListToDTO(list))
  })
  .handler()
