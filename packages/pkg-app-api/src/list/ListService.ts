import type { DbClient } from 'pkg-app-api/src/common/DbClient'
import { maybe } from 'pkg-app-api/src/common/DbClient'
import { requireRole } from 'pkg-app-api/src/user/RoleChecker'
import type { List, ListStatusEnum, User } from 'pkg-app-model/client'

export type ListDetails = List &
  Readonly<{
    requestedBy: User
    approvedBy?: User
  }>

export type CreateListOptions = Readonly<{
  owner: string
  repo: string
  requestedByUser: User
}>

export const createList = async (dbClient: DbClient, options: CreateListOptions): Promise<List> => {
  const { owner, repo, requestedByUser } = options

  const existingList = await dbClient.list.findUnique({
    where: { owner_repo: { owner, repo } },
  })

  if (existingList) {
    throw new Error(`List ${owner}/${repo} already exists`)
  }

  const now = new Date()

  const list = await dbClient.list.create({
    data: {
      owner,
      repo,
      status: 'INACTIVE',
      description: '',
      starCount: 0,
      tags: [],
      requestedById: requestedByUser.id,
      requestedAt: now,
      isApproved: false,
      updatedAt: now,
    },
  })

  return list
}

export type UpdateListOptions = Readonly<{
  owner: string
  repo: string
  description?: string
  starCount?: number
  tags?: string[]
  updatedByUser: User
}>

export const updateList = async (dbClient: DbClient, options: UpdateListOptions): Promise<List> => {
  const { owner, repo, description, starCount, tags, updatedByUser } = options

  requireRole(updatedByUser, 'REVIEWER')

  await dbClient.list.findUniqueOrThrow({
    where: { owner_repo: { owner, repo } },
  })

  const list = await dbClient.list.update({
    where: { owner_repo: { owner, repo } },
    data: {
      description,
      starCount,
      tags,
      updatedAt: new Date(),
    },
  })

  return list
}

export type ApproveListOptions = Readonly<{
  owner: string
  repo: string
  approvedByUser: User
}>

export const approveList = async (dbClient: DbClient, options: ApproveListOptions): Promise<List> => {
  const { owner, repo, approvedByUser } = options

  requireRole(approvedByUser, 'REVIEWER')

  const existingList = await dbClient.list.findUniqueOrThrow({
    where: { owner_repo: { owner, repo } },
  })

  if (approvedByUser.id === existingList.requestedById) {
    throw new Error(`User ${approvedByUser.email} cannot approve their own requested list ${owner}/${repo}`)
  }

  const list = await dbClient.list.update({
    where: { owner_repo: { owner, repo } },
    data: {
      isApproved: true,
      approvedById: approvedByUser.id,
      updatedAt: new Date(),
    },
  })

  return list
}

export const findActiveLists = async (dbClient: DbClient): Promise<List[]> => {
  const lists = await dbClient.list.findMany({
    where: { status: 'ACTIVE' },
  })

  return lists
}

export type FindListByOwnerAndRepoOptions = Readonly<{
  owner: string
  repo: string
}>

export const findListByOwnerAndRepo = async (
  dbClient: DbClient,
  options: FindListByOwnerAndRepoOptions,
): Promise<ListDetails> => {
  const { owner, repo } = options

  const list = await dbClient.list.findUniqueOrThrow({
    where: { owner_repo: { owner, repo } },
    include: { requestedBy: true, approvedBy: true },
  })

  return {
    ...list,
    approvedBy: maybe(list.approvedBy),
  }
}

export type SetListStatusOptions = Readonly<{
  owner: string
  repo: string
  status: ListStatusEnum
  updatedByUser: User
}>

export const setListStatus = async (dbClient: DbClient, options: SetListStatusOptions): Promise<List> => {
  const { owner, repo, status, updatedByUser } = options

  requireRole(updatedByUser, 'ADMIN')

  const existingList = await dbClient.list.findUniqueOrThrow({
    where: { owner_repo: { owner, repo } },
  })

  if (status !== 'INACTIVE' && !existingList.isApproved) {
    throw new Error(`Cannot set status ${status} for unapproved list ${owner}/${repo}`)
  }

  const list = await dbClient.list.update({
    where: { owner_repo: { owner, repo } },
    data: { status, updatedAt: new Date() },
  })

  return list
}
