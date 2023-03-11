import assert from 'node:assert'

import type { RoleEnum } from 'pkg-app-model/client'
import type { TestDataPredicate } from 'tests/common/TestDataFinder'
import { createTestDataFinder } from 'tests/common/TestDataFinder'
import { test } from 'tests/common/TestUtils'

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

export const withAuth = (testUser: TestUser) => {
  test.use({
    storageState: `output/test/playwright/setup/${testUser.email.split('@')[0] ?? ''}-auth-state.json`,
  })
}

export const findTestUser = createTestDataFinder(testUsers, ({ and }) => {
  assert.ok(process.env.APP_ROLE_MANAGER_EMAIL)

  const hasRole = (role: RoleEnum): TestDataPredicate<TestUser> => {
    return ({ roles }) => !!roles?.includes(role)
  }

  const hasNoRole: TestDataPredicate<TestUser> = ({ roles }) => !roles?.length

  const isRoleManager: TestDataPredicate<TestUser> = and(
    hasRole('ADMIN'),
    ({ email }) => email === process.env.APP_ROLE_MANAGER_EMAIL,
  )

  return { hasRole, hasNoRole, isRoleManager }
})
