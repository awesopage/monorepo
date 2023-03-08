import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { approveList, createList, setListStatus, updateList } from 'pkg-app-api/src/list/ListService'
import { findUserByEmail } from 'pkg-app-api/src/user/UserService'
import { testLists } from 'tests/data/TestListData'

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
