import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { CreateListOptionsDTO } from 'pkg-app-shared/src/list/ListApiOptions'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'
import { expect, test } from 'tests/common/TestUtils'
import { findTestUser, withAuth } from 'tests/data/TestUserData'

const getCreateListResponse = async (
  request: APIRequestContext,
  options: CreateListOptionsDTO,
): Promise<APIResponse> => {
  return request.post('/api/lists', { data: options })
}

const getFindActiveListsResponse = async (request: APIRequestContext): Promise<APIResponse> => {
  return request.get('/api/lists')
}

test.describe('given signed in but no role', () => {
  withAuth(findTestUser(({ hasNoRole }) => hasNoRole).any())

  test.describe('when create list', () => {
    test('should receive correct list', async ({ request }) => {
      const createListResponse = await getCreateListResponse(request, {
        owner: 'owner',
        repo: 'repo',
      })
      const list: ListDTO = await createListResponse.json()
      expect(list).toMatchObject({
        owner: 'owner',
        repo: 'repo',
      })
    })
  })
})

test.describe('given not signed in', () => {
  test.describe('when create list', () => {
    test('should receive error', async ({ request }) => {
      const createListResponse = await getCreateListResponse(request, {
        owner: 'owner',
        repo: 'repo',
      })

      expect(createListResponse.ok()).toBe(false)
    })
  })

  test.describe('when find active lists', () => {
    test('should receive correct lists', async ({ request }) => {
      const findListsResponse = await getFindActiveListsResponse(request)

      const lists: ListDTO[] = await findListsResponse.json()

      expect(lists).toMatchObject([
        {
          owner: 'owner1',
          repo: 'repo1',
        },
        {
          owner: 'owner1',
          repo: 'repo2',
        },
        {
          owner: 'owner2',
          repo: 'repo3',
        },
      ])
    })
  })
})
