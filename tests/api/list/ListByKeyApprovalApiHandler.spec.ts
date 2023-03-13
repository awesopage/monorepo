import assert from 'node:assert'

import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'
import { expect, test } from 'tests/common/TestUtils'
import { findTestList } from 'tests/data/TestListData'
import { findTestUser, withAuth } from 'tests/data/TestUserData'

const getApproveListResponse = async (
  request: APIRequestContext,
  owner: string,
  repo: string,
): Promise<APIResponse> => {
  return request.post(`/api/lists/${owner}/${repo}/approval`)
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

  test.describe('when approve list requested by different user', () => {
    test('should receive correct list', async ({ request }) => {
      const approveListResponse = await getApproveListResponse(
        request,
        listRequestedByDiffUser.owner,
        listRequestedByDiffUser.repo,
      )

      const list: ListDTO = await approveListResponse.json()

      expect(list).toMatchObject({
        owner: listRequestedByDiffUser.owner,
        repo: listRequestedByDiffUser.repo,
        isApproved: true,
      })
    })
  })

  test.describe('when approve list requested by same user', () => {
    test('should receive error', async ({ request }) => {
      const approveListResponse = await getApproveListResponse(
        request,
        listRequestedBySameUser.owner,
        listRequestedBySameUser.repo,
      )

      expect(approveListResponse.ok()).toBe(false)
    })
  })
})
