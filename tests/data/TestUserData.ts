import type { RoleEnum } from 'pkg-app-model/client'
import { requireDefined, test } from 'tests/common/TestUtils'

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

export const withTestUser = (testUser: TestUser) => {
  test.use({
    storageState: `output/test/playwright/setup/${testUser.email.split('@')[0] ?? ''}-auth-state.json`,
  })
}

const hasRole = (testUser: TestUser, role: RoleEnum) => {
  return testUser.roles?.includes(role)
}

const isRoleManager = (testUser: TestUser) => {
  return testUser.email === process.env.APP_ROLE_MANAGER_EMAIL
}

export const testUserReferences = {
  admin: requireDefined(testUsers.find((testUser) => hasRole(testUser, 'ADMIN'))),
  notAdmin: requireDefined(testUsers.find((testUser) => !hasRole(testUser, 'ADMIN'))),
  roleManager: requireDefined(testUsers.find((testUser) => hasRole(testUser, 'ADMIN') && isRoleManager(testUser))),
  adminButNotRoleManager: requireDefined(
    testUsers.find((testUser) => hasRole(testUser, 'ADMIN') && !isRoleManager(testUser)),
  ),
  reviewer: requireDefined(testUsers.find((testUser) => hasRole(testUser, 'REVIEWER'))),
  noRole: requireDefined(testUsers.find((testUser) => !testUser.roles?.length)),
}
