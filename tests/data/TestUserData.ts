import type { RoleEnum } from 'pkg-app-model/client'
import type { FilterCondition } from 'tests/common/TestUtils'
import { conditionHelpers, createTestDataFinders, test } from 'tests/common/TestUtils'

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

export const testUserConditions = {
  hasRole: (role: RoleEnum): FilterCondition<TestUser> => {
    return (testUser) => !!testUser.roles?.includes(role)
  },
  isRoleManager: (): FilterCondition<TestUser> => {
    return (testUser) => testUser.email === process.env.APP_ROLE_MANAGER_EMAIL
  },
}

export const testUserFinders = createTestDataFinders(testUsers, {
  admin: [testUserConditions.hasRole('ADMIN')],
  notAdmin: [conditionHelpers.negate(testUserConditions.hasRole('ADMIN'))],
  roleManager: [testUserConditions.hasRole('ADMIN'), testUserConditions.isRoleManager()],
  adminButNotRoleManager: [
    testUserConditions.hasRole('ADMIN'),
    conditionHelpers.negate(testUserConditions.isRoleManager()),
  ],
  reviewer: [testUserConditions.hasRole('REVIEWER')],
  noRole: [(testUser) => !testUser.roles?.length],
})
