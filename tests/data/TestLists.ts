import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { approveList, createList, setListStatus, updateList } from 'pkg-app-api/src/list/ListService'
import { findUserByEmail } from 'pkg-app-api/src/user/UserService'
import type { ListStatusEnum } from 'pkg-app-model/client'

export type TestList = Readonly<{
  owner: string
  repo: string
  description: string
  starCount: number
  tags: string[]
  requestedByEmail: string
  approvedByEmail?: string
  currentStatus?: ListStatusEnum
}>

export const testLists: TestList[] = [
  {
    owner: 'owner1',
    repo: 'repo1',
    description: 'Awesome List 1',
    starCount: 100_000,
    tags: ['topic1', 'topic2'],
    requestedByEmail: 'user1@example.com',
    approvedByEmail: 'reviewer2@example.com',
  },
  {
    owner: 'owner1',
    repo: 'repo2',
    description: 'Awesome List 2',
    starCount: 50_000,
    tags: ['topic2', 'topic3'],
    requestedByEmail: 'user2@example.com',
    approvedByEmail: 'reviewer1@example.com',
  },
  {
    owner: 'owner2',
    repo: 'repo3',
    description: 'Awesome List 3',
    starCount: 5_000,
    tags: ['topic1', 'topic3'],
    requestedByEmail: 'reviewer1@example.com',
  },
  {
    owner: 'owner2',
    repo: 'repo4-inactive',
    description: 'Awesome List 4 - Inactive',
    starCount: 10_000,
    tags: ['topic2', 'topic4'],
    requestedByEmail: 'admin2@example.com',
    currentStatus: 'INACTIVE',
  },
]

export const createTestLists = async () => {
  await prismaClient.$transaction(async (dbClient) => {
    const admin1 = await findUserByEmail(dbClient, 'admin1@example.com')

    for (const testList of testLists) {
      const { owner, repo, description, starCount, tags, requestedByEmail, approvedByEmail, currentStatus } = testList

      const requestedByUser = await findUserByEmail(dbClient, requestedByEmail)
      const approvedByUser = approvedByEmail ? await findUserByEmail(dbClient, approvedByEmail) : undefined

      await createList(dbClient, { owner, repo, requestedByUser })

      await updateList(dbClient, { owner, repo, description, starCount, tags, updatedByUser: approvedByUser ?? admin1 })

      if (approvedByUser) {
        await approveList(dbClient, { owner, repo, approvedByUser })
      }

      if (currentStatus) {
        await setListStatus(dbClient, { owner, repo, status: currentStatus, updatedByUser: admin1 })
      }
    }
  })
}
