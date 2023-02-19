import type { User } from 'pkg-app-model/client'
import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'
import { expect, queryTestData, test, useTestUser } from 'tests/common/TestUtils'

test.describe('rolesApiHandler', () => {
  test.describe('given signed in as admin', () => {
    useTestUser('admin1')

    test('should return user with assigned roles', async ({ page }) => {
      expect(await getCurrentRoles('user1@example.com')).not.toContain('REVIEWER')

      const assignUserRoles = await page.request.post('/api/roles', {
        data: {
          email: 'user1@example.com',
          roles: ['REVIEWER'],
        },
      })
      const user: UserDTO = await assignUserRoles.json()

      expect(user).toMatchObject({
        email: 'user1@example.com',
        roles: ['REVIEWER'],
      })

      expect(await getCurrentRoles('user1@example.com')).toContain('REVIEWER')
    })
  })

  test.describe('given signed in as non-role-admin', () => {
    // APP_ROLE_ADMIN_EMAIL is set to admin1, so admin2 is not a role-admin
    useTestUser('admin2')

    test('should throw error when assigning ADMIN', async ({ page }) => {
      const assignUserRoles = await page.request.post('/api/roles', {
        data: {
          email: 'user1@example.com',
          roles: ['ADMIN'],
        },
      })

      expect(assignUserRoles.ok()).toBe(false)
    })
  })

  test.describe('given signed in as non-admin', () => {
    useTestUser('reviewer1')

    test('should throw error', async ({ page }) => {
      const assignUserRoles = await page.request.post('/api/roles', {
        data: {
          email: 'user1@example.com',
          roles: ['REVIEWER'],
        },
      })

      expect(assignUserRoles.ok()).toBe(false)
    })
  })

  test.describe('given not signed in', () => {
    test('should throw error', async ({ page }) => {
      const assignUserRoles = await page.request.post('/api/roles', {
        data: {
          email: 'user1@example.com',
          roles: ['REVIEWER'],
        },
      })

      expect(assignUserRoles.ok()).toBe(false)
    })
  })
})

const getCurrentRoles = async (email: string) => {
  const users = (await queryTestData('user', { email })) as User[]

  return users[0]?.roles ?? []
}
