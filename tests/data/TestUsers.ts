import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { assignUserRoles, findOrCreateUser, findUserByEmail } from 'pkg-app-api/src/user/UserService'
import type { RoleEnum } from 'pkg-app-model/client'
import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'

export type TestUser = Readonly<{
  email: string
  displayName: string
  roles?: RoleEnum[]
}>

export const testUsers: TestUser[] = [
  {
    email: 'admin1@example.com',
    displayName: 'Admin 1',
    roles: ['ADMIN', 'REVIEWER'],
  },
  {
    email: 'admin2@example.com',
    displayName: 'Admin 2',
    roles: ['ADMIN', 'REVIEWER'],
  },
  {
    email: 'reviewer1@example.com',
    displayName: 'Reviewer 1',
    roles: ['REVIEWER'],
  },
  {
    email: 'reviewer2@example.com',
    displayName: 'Reviewer 2',
    roles: ['REVIEWER'],
  },
  {
    email: 'user1@example.com',
    displayName: 'User 1',
  },
  {
    email: 'user2@example.com',
    displayName: 'User 2',
  },
]

export const createTestUsers = async () => {
  await prismaClient.$transaction(async (dbClient) => {
    for (const testUser of testUsers) {
      const { email, displayName } = testUser

      await findOrCreateUser(dbClient, { email, displayName })
    }

    assertDefined(process.env.APP_ROLE_ADMIN_EMAIL, 'APP_ROLE_ADMIN_EMAIL')

    const roleAdmin = await findUserByEmail(dbClient, process.env.APP_ROLE_ADMIN_EMAIL)

    for (const testUser of testUsers) {
      const { email, roles } = testUser

      if (roles) {
        await assignUserRoles(dbClient, { email, roles, assignedByUser: roleAdmin })
      }
    }
  })
}
