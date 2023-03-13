import assert from 'node:assert'

import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { UpdateListOptionsDTO } from 'pkg-app-shared/src/list/ListApiOptions'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'
import { expect, test } from 'tests/common/TestUtils'
import { findTestList } from 'tests/data/TestListData'
import { findTestUser, withAuth } from 'tests/data/TestUserData'

const getUpdateListResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
  options: UpdateListOptionsDTO,
): Promise<APIResponse> => {
  return request.patch(`/api/lists/${owner}/${repo}`, { data: options })
}

const getFindListByKeyResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
): Promise<APIResponse> => {
  return request.get(`/api/lists/${owner}/${repo}`)
}

test.describe('given signed in as reviewer', () => {
  const reviewers = findTestUser(({ hasRole }) => hasRole('REVIEWER')).all()
  const { reviewer, listRequestedBySameUser, listRequestedByDiffUser } =
    reviewers
      .map((reviewer) => {
        const listRequestedBySameUser = findTestList(({ isRequestedBy }) => isRequestedBy(reviewer.email)).peek()
        const listRequestedByDiffUser = findTestList(({ isRequestedBy, not }) =>
          not(isRequestedBy(reviewer.email)),
        ).peek()

        return { reviewer, listRequestedBySameUser, listRequestedByDiffUser }
      })
      .find(
        ({ listRequestedBySameUser, listRequestedByDiffUser }) => listRequestedBySameUser && listRequestedByDiffUser,
      ) ?? {}

  assert.ok(reviewer)
  assert.ok(listRequestedBySameUser)
  assert.ok(listRequestedByDiffUser)

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
})

test.describe('given signed in but no role', () => {
  withAuth(findTestUser(({ hasNoRole }) => hasNoRole).any())

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
})

test.describe('given not signed in', () => {
  test.describe('when find list by key', () => {
    test('should receive correct list', async ({ request }) => {
      const findListsByKeyResponse = await getFindListByKeyResponse(request, 'owner1', 'repo1')
      const lists: ListDTO[] = await findListsByKeyResponse.json()
      expect(lists).toMatchObject({
        owner: 'owner1',
        repo: 'repo1',
      })
    })
  })
})
