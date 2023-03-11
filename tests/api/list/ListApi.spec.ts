import type { APIRequestContext, APIResponse } from '@playwright/test'

import type {
  CreateListOptionsDTO,
  SetListStatusDTO,
  UpdateListOptionsDTO,
} from 'pkg-app-shared/src/list/ListApiOptions'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'
import { expect, test } from 'tests/common/TestUtils'
import { findTestList } from 'tests/data/TestListData'
import { findTestUser, withAuth } from 'tests/data/TestUserData'

const getCreateListResponse = async (
  request: APIRequestContext,
  options: CreateListOptionsDTO,
): Promise<APIResponse> => {
  return request.post('/api/lists', { data: options })
}

const getUpdateListResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
  options: UpdateListOptionsDTO,
): Promise<APIResponse> => {
  return request.patch(`/api/lists/${owner}/${repo}`, { data: options })
}

const getApproveListResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
): Promise<APIResponse> => {
  return request.post(`/api/lists/${owner}/${repo}/approval`)
}

const getSetListStatusResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
  options: SetListStatusDTO,
): Promise<APIResponse> => {
  return request.put(`/api/lists/${owner}/${repo}/status`, { data: options })
}

const getFindListsResponse = async (request: APIRequestContext): Promise<APIResponse> => {
  return request.get('/api/lists')
}

const getFindListsByKeyResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
): Promise<APIResponse> => {
  return request.get(`/api/lists/${owner}/${repo}`)
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

test.describe('given signed in as reviewer', () => {
  const reviewer = findTestUser(({ hasRole }) => hasRole('REVIEWER')).any()
  withAuth(reviewer)

  test.describe('when update list', () => {
    test('should receive correct list', async ({ request }) => {
      const updateListResponse = await getUpdateListResponse(request, 'owner2', 'repo4-inactive', {
        description: 'description',
        starCount: 1,
        tags: ['tag'],
      })

      const list: ListDTO = await updateListResponse.json()

      expect(list).toMatchObject({
        owner: 'owner2',
        repo: 'repo4-inactive',
        description: 'description',
        starCount: 1,
        tags: ['tag'],
      })
    })
  })

  test.describe('when approve list requested by different user', () => {
    test('should receive correct list', async ({ request }) => {
      const requestedList = findTestList(({ hasRequestedByEmail, not }) =>
        not(hasRequestedByEmail(reviewer.email)),
      ).any()
      const approveListResponse = await getApproveListResponse(request, requestedList.owner, requestedList.repo)

      const list: ListDTO = await approveListResponse.json()

      expect(list).toMatchObject({
        owner: requestedList.owner,
        repo: requestedList.repo,
        isApproved: true,
      })
    })
  })

  test.describe('when approve list requested by same user', () => {
    test('should receive error', async ({ request }) => {
      const requestedList = findTestList(({ hasRequestedByEmail }) => hasRequestedByEmail(reviewer.email)).any()
      const approveListResponse = await getApproveListResponse(request, requestedList.owner, requestedList.repo)

      expect(approveListResponse.ok()).toBe(false)
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

  test.describe('when update list', () => {
    test('should receive error', async ({ request }) => {
      const updateListResponse = await getUpdateListResponse(request, 'owner', 'repo', {
        description: 'description',
        starCount: 1,
        tags: ['tag'],
      })

      expect(updateListResponse.ok()).toBe(false)
    })
  })

  test.describe('when approve list', () => {
    test('should receive error', async ({ request }) => {
      const approveListResponse = await getApproveListResponse(request, 'owner', 'repo')

      expect(approveListResponse.ok()).toBe(false)
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

  test.describe('when find lists', () => {
    test('should receive correct lists', async ({ request }) => {
      const findListsResponse = await getFindListsResponse(request)

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

  test.describe('when find list by key', () => {
    test('should receive correct list', async ({ request }) => {
      const findListsByKeyResponse = await getFindListsByKeyResponse(request, 'owner1', 'repo1')
      const lists: ListDTO[] = await findListsByKeyResponse.json()
      expect(lists).toMatchObject({
        owner: 'owner1',
        repo: 'repo1',
      })
    })
  })
})
