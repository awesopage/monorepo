import type { AuthMeDTO } from 'pkg-app-shared/src/auth/AuthMeDTO'
import { expect, test } from 'tests/common/TestUtils'

test.describe('AuthMeApiHandler', () => {
  test('should return current user when signed in', async ({ page }) => {
    await page.request.post('/api/__test/auth', {
      data: {
        email: 'user1@example.com',
      },
    })

    const getAuthMe = await page.request.get('/api/auth/me')
    const authMe: AuthMeDTO = await getAuthMe.json()

    expect(authMe.user).toMatchObject({
      email: 'user1@example.com',
      displayName: 'User 1',
    })
  })

  test('should return no user when not signed in', async ({ page }) => {
    const getAuthMe = await page.request.get('/api/auth/me')
    const authMe: AuthMeDTO = await getAuthMe.json()

    expect(authMe.user).toBeUndefined()
  })
})
