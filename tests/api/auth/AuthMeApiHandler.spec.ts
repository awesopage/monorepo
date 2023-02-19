import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { AuthMeDTO } from 'pkg-app-shared/src/auth/AuthMeDTO'
import { expect, test, useTestUser } from 'tests/common/TestUtils'

test.describe('authMeApiHandler', () => {
  test.describe('given signed in', () => {
    useTestUser('user1')

    test('should return current user', async ({ request }) => {
      const authMeResponse = await getAuthMeResponse(request)
      const authMe: AuthMeDTO = await authMeResponse.json()

      expect(authMe.user).toMatchObject({
        email: 'user1@example.com',
        displayName: 'User 1',
      })
    })
  })

  test.describe('given not signed in', () => {
    test('should return no user', async ({ request }) => {
      const authMeResponse = await getAuthMeResponse(request)
      const authMe: AuthMeDTO = await authMeResponse.json()

      expect(authMe.user).toBeUndefined()
    })
  })
})

const getAuthMeResponse = async (request: APIRequestContext): Promise<APIResponse> => {
  return request.get('/api/auth/me')
}
