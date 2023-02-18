import type { AuthMeDTO } from 'pkg-app-shared/src/auth/AuthMeDTO'
import { expect, test, useTestUser } from 'tests/common/TestUtils'

test.describe('AuthMeApiHandler', () => {
  test.describe('when signed in', () => {
    useTestUser('user1')

    test('should return current user', async ({ page }) => {
      const getAuthMe = await page.request.get('/api/auth/me')
      const authMe: AuthMeDTO = await getAuthMe.json()

      expect(authMe.user).toMatchObject({
        email: 'user1@example.com',
        displayName: 'User 1',
      })
    })
  })

  test.describe('when not signed in', () => {
    test('should return no user when not signed in', async ({ page }) => {
      const getAuthMe = await page.request.get('/api/auth/me')
      const authMe: AuthMeDTO = await getAuthMe.json()

      expect(authMe.user).toBeUndefined()
    })
  })
})
