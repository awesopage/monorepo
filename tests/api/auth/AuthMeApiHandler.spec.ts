import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { AuthMeDTO } from 'pkg-app-shared/src/auth/AuthMeDTO'
import { expect, test } from 'tests/common/TestUtils'
import { findTestUser, withAuth } from 'tests/data/TestUserData'

const getAuthMeResponse = async (request: APIRequestContext): Promise<APIResponse> => {
  return request.get('/api/auth/me')
}

test.describe('given signed in', () => {
  const user = findTestUser(({ hasNoRole }) => hasNoRole).any()

  withAuth(user)

  test.describe('when get current user', () => {
    test('should receive correct user', async ({ request }) => {
      const authMeResponse = await getAuthMeResponse(request)
      const authMe: AuthMeDTO = await authMeResponse.json()

      expect(authMe.user).toMatchObject({
        email: user.email,
        displayName: user.displayName,
      })
    })
  })
})

test.describe('given not signed in', () => {
  test.describe('when get current user', () => {
    test('should receive no user', async ({ request }) => {
      const authMeResponse = await getAuthMeResponse(request)
      const authMe: AuthMeDTO = await authMeResponse.json()

      expect(authMe.user).toBeUndefined()
    })
  })
})
