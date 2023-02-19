import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { RoleEnum, User } from 'pkg-app-model/client'
import type { AssignUserRolesOptionsDTO } from 'pkg-app-shared/src/user/RoleApiOptions'
import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'
import { expect, queryTestData, test, useTestUser } from 'tests/common/TestUtils'

// APP_ROLE_ADMIN_EMAIL is set to admin1
const ROLE_ADMIN_USER = 'admin1'
const NON_ROLE_ADMIN_USER = 'admin2'

test.describe('rolesApiHandler', () => {
  test.describe('given signed in as admin', () => {
    useTestUser('admin1')

    test('should return user with assigned roles', async ({ request }) => {
      expect(await getCurrentRoles('user1@example.com')).not.toContain('REVIEWER')

      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['REVIEWER'],
      })
      const user: UserDTO = await assignUserRolesResponse.json()

      expect(user).toMatchObject({
        email: 'user1@example.com',
        roles: ['REVIEWER'],
      })

      expect(await getCurrentRoles('user1@example.com')).toContain('REVIEWER')
    })
  })

  test.describe('given signed in as role-admin', () => {
    useTestUser(ROLE_ADMIN_USER)

    test('should return user with assigned roles when assigning ADMIN', async ({ request }) => {
      expect(await getCurrentRoles('user1@example.com')).not.toContain('ADMIN')

      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['ADMIN'],
      })
      const user: UserDTO = await assignUserRolesResponse.json()

      expect(user).toMatchObject({
        email: 'user1@example.com',
        roles: ['ADMIN'],
      })

      expect(await getCurrentRoles('user1@example.com')).toContain('ADMIN')
    })
  })

  test.describe('given signed in as non-role-admin', () => {
    useTestUser(NON_ROLE_ADMIN_USER)

    test('should throw error when assigning ADMIN', async ({ request }) => {
      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['ADMIN'],
      })

      expect(assignUserRolesResponse.ok()).toBe(false)
    })
  })

  test.describe('given signed in as non-admin', () => {
    useTestUser('reviewer1')

    test('should throw error', async ({ request }) => {
      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['REVIEWER'],
      })

      expect(assignUserRolesResponse.ok()).toBe(false)
    })
  })

  test.describe('given not signed in', () => {
    test('should throw error', async ({ request }) => {
      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['REVIEWER'],
      })

      expect(assignUserRolesResponse.ok()).toBe(false)
    })
  })
})

const getAssignUserRolesResponse = async (
  request: APIRequestContext,
  options: AssignUserRolesOptionsDTO,
): Promise<APIResponse> => {
  return request.post('/api/roles', { data: options })
}

const getCurrentRoles = async (email: string): Promise<RoleEnum[]> => {
  const users = (await queryTestData('user', { email })) as User[]

  return users[0]?.roles ?? []
}
