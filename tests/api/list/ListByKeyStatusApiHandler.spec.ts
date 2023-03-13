import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { SetListStatusDTO } from 'pkg-app-shared/src/list/ListApiOptions'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'
import { expect, test } from 'tests/common/TestUtils'
import { findTestUser, withAuth } from 'tests/data/TestUserData'

const getSetListStatusResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
  options: SetListStatusDTO,
): Promise<APIResponse> => {
  return request.put(`/api/lists/${owner}/${repo}/status`, { data: options })
}

test.describe('given signed in as admin', () => {
  withAuth(findTestUser(({ hasRole }) => hasRole('ADMIN')).any())

  test.describe('when set approved-list status', () => {
    test('should receive correct list', async ({ request }) => {
      const setStatusListResponse = await getSetListStatusResponse(request, 'owner1', 'repo1', { status: 'ACTIVE' })

      const list: ListDTO = await setStatusListResponse.json()

      expect(list).toMatchObject({
        owner: 'owner1',
        repo: 'repo1',
        status: 'ACTIVE',
      })
    })
  })

  test.describe('when set unapproved-list status', () => {
    test('should receive error', async ({ request }) => {
      const setStatusListResponse = await getSetListStatusResponse(request, 'owner2', 'repo4', { status: 'ACTIVE' })

      expect(setStatusListResponse.ok()).toBe(false)
    })
  })
})

test.describe('given signed in but not admin', () => {
  withAuth(findTestUser(({ hasRole, not }) => not(hasRole('ADMIN'))).any())

  test.describe('when set list status', () => {
    test('should receive error', async ({ request }) => {
      const setStatusListResponse = await getSetListStatusResponse(request, 'owner1', 'repo1', { status: 'ACTIVE' })

      expect(setStatusListResponse.ok()).toBe(false)
    })
  })
})
