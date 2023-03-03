import type { NextApiHandler, NextApiResponse } from 'next'

import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { requireListOwnerAndRepo } from 'pkg-app-api/src/list/ListApiHelper'
import { mapListToDTO } from 'pkg-app-api/src/list/ListMapper'
import {
  approveList,
  createList,
  findActiveLists,
  findListByOwnerAndRepo,
  setListStatus,
  updateList,
} from 'pkg-app-api/src/list/ListService'
import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { checkSignedIn, createApiRouter, requireCurrentUser } from 'pkg-app-api/src/router/ApiRouter'
import type { List } from 'pkg-app-model/client'
import type {
  CreateListOptionsDTO,
  SetListStatusDTO,
  UpdateListOptionsDTO,
} from 'pkg-app-shared/src/list/ListApiOptions'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'

export const listsApiHandler: NextApiHandler = createApiRouter()
  .get(async (req, res: NextApiResponse<ListDTO[]>) => {
    const lists: List[] = await prismaClient.$transaction((dbClient) => {
      return findActiveLists(dbClient)
    })

    sendApiResponse(
      res,
      lists.map((list) => mapListToDTO(list)),
    )
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

export const listByKeyStatusApiHandler: NextApiHandler = createApiRouter()
  .use(checkSignedIn())
  .put(async (req, res: NextApiResponse<ListDTO>) => {
    const { status } = req.body as SetListStatusDTO
    const currentUser = requireCurrentUser(req)
    const { owner, repo } = requireListOwnerAndRepo(req)

    const list: List = await prismaClient.$transaction((dbClient) => {
      return setListStatus(dbClient, {
        owner,
        repo,
        status,
        updatedByUser: currentUser,
      })
    })

    sendApiResponse(res, mapListToDTO(list))
  })
  .handler()

export const listByKeyApiHandler: NextApiHandler = createApiRouter()
  .get(async (req, res: NextApiResponse<ListDTO>) => {
    const { owner, repo } = requireListOwnerAndRepo(req)

    const list: List = await findListByOwnerAndRepo(prismaClient, { owner, repo })

    sendApiResponse(res, mapListToDTO(list))
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
