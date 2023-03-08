import { prismaClient } from 'pkg-app-api/src/common/DbClient'
import { assignUserRoles, findOrCreateUser, findUserByEmail } from 'pkg-app-api/src/user/UserService'
import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'
import { testUsers } from 'tests/data/TestUserData'

export const createTestUsers = async () => {
  await prismaClient.$transaction(async (dbClient) => {
    for (const testUser of testUsers) {
      const { email, displayName } = testUser

      await findOrCreateUser(dbClient, { email, displayName })
    }

    assertDefined(process.env.APP_ROLE_ADMIN_EMAIL, 'APP_ROLE_ADMIN_EMAIL')

    for (const testUser of testUsers) {
      const { email, roles } = testUser

      if (roles) {
        const roleAdmin = await findUserByEmail(dbClient, process.env.APP_ROLE_ADMIN_EMAIL)

        await assignUserRoles(dbClient, { email, roles, assignedByUser: roleAdmin })
      }
    }
  })
}
