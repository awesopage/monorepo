import * as iron from '@hapi/iron'
import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { AuthInfo } from 'pkg-app-api/src/auth/AuthService'
import type { AuthMeDTO } from 'pkg-app-shared/src/auth/AuthMeDTO'
import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'
import { expect, test, withTestUser } from 'tests/common/TestUtils'

const getAuthCallbackResponse = async (request: APIRequestContext, token: string): Promise<APIResponse> => {
  return request.post(`/api/auth/callback?token=${encodeURIComponent(token)}`)
}

const getAuthMeResponse = async (request: APIRequestContext): Promise<APIResponse> => {
  return request.get('/api/auth/me')
}

const testReturnUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/welcome`

test.describe('given signed in', () => {
  withTestUser('user1')

  test.describe('when get current user', () => {
    test('should receive correct user', async ({ request }) => {
      const authMeResponse = await getAuthMeResponse(request)
      const authMe: AuthMeDTO = await authMeResponse.json()

      expect(authMe.user).toMatchObject({
        email: 'user1@example.com',
        displayName: 'User 1',
      })
    })
  })
})

test.describe('given not signed in', () => {
  test.describe('when provide valid token to auth callback', () => {
    test('should receive correct user', async ({ request }) => {
      const token = await getAuthToken({
        email: 'test_user@example.com',
        displayName: 'Test User',
      })

      const authCallbackResponse = await getAuthCallbackResponse(request, token)
      const user: UserDTO = await authCallbackResponse.json()

      expect(user).toMatchObject({
        email: 'test_user@example.com',
        displayName: 'Test User',
      })
    })
  })

  test.describe('when provide valid token with return url to auth callback', () => {
    test('should receive session and be moved to correct url', async ({ request }) => {
      const token = await getAuthToken({
        email: 'test_user@example.com',
        returnUrl: testReturnUrl,
      })

      const authCallbackResponse = await getAuthCallbackResponse(request, token)

      expect(authCallbackResponse.url()).toBe(testReturnUrl)

      const authMeResponse = await getAuthMeResponse(request)
      const authMe: AuthMeDTO = await authMeResponse.json()

      expect(authMe.user).toMatchObject({
        email: 'test_user@example.com',
        displayName: 'test_user',
      })
    })
  })

  test.describe('when provide valid token but with invalid email to auth callback', () => {
    test('should receive error', async ({ request }) => {
      const token = await getAuthToken({
        email: 'test_user',
        returnUrl: testReturnUrl,
      })

      const authCallbackResponse = await getAuthCallbackResponse(request, token)

      await expectAuthCallbackError(authCallbackResponse, request)
    })
  })

  test.describe('when provide valid token but from different secret to auth callback', () => {
    test('should receive error', async ({ request }) => {
      const token = await getAuthToken(
        {
          email: 'test_user',
          returnUrl: testReturnUrl,
        },
        'local__app__auth__different__secret',
      )

      const authCallbackResponse = await getAuthCallbackResponse(request, token)

      await expectAuthCallbackError(authCallbackResponse, request)
    })
  })

  test.describe('when provide invalid token to auth callback', () => {
    test('should receive error', async ({ request }) => {
      const authCallbackResponse = await getAuthCallbackResponse(request, 'test_token')

      await expectAuthCallbackError(authCallbackResponse, request)
    })
  })

  test.describe('when get current user', () => {
    test('should receive no user', async ({ request }) => {
      const authMeResponse = await getAuthMeResponse(request)
      const authMe: AuthMeDTO = await authMeResponse.json()

      expect(authMe.user).toBeUndefined()
    })
  })
})

const getAuthToken = (authInfo: AuthInfo, secret?: string): Promise<string> => {
  return iron.seal(authInfo, secret ?? process.env.APP_AUTH_SECRET ?? '', {
    ...iron.defaults,
    ttl: 60_000,
  })
}

const expectAuthCallbackError = async (authCallbackResponse: APIResponse, request: APIRequestContext) => {
  expect(authCallbackResponse.url()).toBe(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/auth-error`)

  const authMeResponse = await getAuthMeResponse(request)
  const authMe: AuthMeDTO = await authMeResponse.json()

  expect(authMe.user).toBeUndefined()
}
