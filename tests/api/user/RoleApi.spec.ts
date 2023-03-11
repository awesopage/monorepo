import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { AssignUserRolesOptionsDTO } from 'pkg-app-shared/src/user/RoleApiOptions'
import type { Role, UserDTO } from 'pkg-app-shared/src/user/UserDTO'
import { expect, test, testDataApi } from 'tests/common/TestUtils'
import { findTestUser, withAuth } from 'tests/data/TestUserData'

const getAssignUserRolesResponse = async (
  request: APIRequestContext,
  options: AssignUserRolesOptionsDTO,
): Promise<APIResponse> => {
  return request.post('/api/roles', { data: options })
}

test.describe('given signed in as role manager', () => {
  withAuth(findTestUser(({ isRoleManager }) => isRoleManager).first())

  test.describe('when assign ADMIN role to user', () => {
    test('should receive correct user', async ({ request }) => {
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
})

test.describe('given signed in as admin but not role manager', () => {
  withAuth(
    findTestUser(({ hasRole, isRoleManager, and, not }) => {
      return and(hasRole('ADMIN'), not(isRoleManager))
    }).first(),
  )

  test.describe('when assign ADMIN role to user', () => {
    test('should receive error', async ({ request }) => {
      expect(await getCurrentRoles('user1@example.com')).not.toContain('ADMIN')

      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['ADMIN'],
      })

      expect(assignUserRolesResponse.ok()).toBe(false)
    })
  })
})

test.describe('given signed in as admin', () => {
  withAuth(findTestUser(({ hasRole }) => hasRole('ADMIN')).first())

  test.describe('when assign role to user', () => {
    test('should receive correct user', async ({ request }) => {
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
})

test.describe('given signed in but not admin', () => {
  withAuth(findTestUser(({ hasRole, not }) => not(hasRole('ADMIN'))).first())

  test.describe('when assign role to user', () => {
    test('should receive error', async ({ request }) => {
      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['REVIEWER'],
      })

      expect(assignUserRolesResponse.ok()).toBe(false)
    })
  })
})

test.describe('given not signed in', () => {
  test.describe('when assign role to user', () => {
    test('should receive error', async ({ request }) => {
      const assignUserRolesResponse = await getAssignUserRolesResponse(request, {
        email: 'user1@example.com',
        roles: ['REVIEWER'],
      })

      expect(assignUserRolesResponse.ok()).toBe(false)
    })
  })
})

const getCurrentRoles = async (email: string): Promise<Role[]> => {
  const users = await testDataApi.post({ email }, '/users').json<UserDTO[]>()

  return users[0]?.roles ?? []
}
