import type { APIRequestContext, APIResponse } from '@playwright/test'

import type {
  CreateListOptionsDTO,
  SetListStatusDTO,
  UpdateListOptionsDTO,
} from 'pkg-app-shared/src/list/ListApiOptions'
import { test } from 'tests/common/TestUtils'

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
  test.describe('when set approved-list status', () => {
    test.skip('should receive correct list', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when set unapproved-list status', () => {
    test.skip('should receive error', async ({ request }) => {
      // TODO
    })
  })
})

test.describe('given signed in as reviewer', () => {
  test.describe('when update list', () => {
    test.skip('should receive correct list', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when approve list requested by different user', () => {
    test.skip('should receive correct list', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when approve list requested by same user', () => {
    test.skip('should receive error', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when set list status', () => {
    test.skip('should receive error', async ({ request }) => {
      // TODO
    })
  })
})

test.describe('given signed in but no role', () => {
  test.describe('when create list', () => {
    test.skip('should receive correct list', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when update list', () => {
    test.skip('should receive error', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when approve list', () => {
    test.skip('should receive error', async ({ request }) => {
      // TODO
    })
  })
})

test.describe('given not signed in', () => {
  test.describe('when create list', () => {
    test.skip('should receive error', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when find lists', () => {
    test.skip('should receive correct lists', async ({ request }) => {
      // TODO
    })
  })

  test.describe('when find list by key', () => {
    test.skip('should receive correct list', async ({ request }) => {
      // TODO
    })
  })
})
