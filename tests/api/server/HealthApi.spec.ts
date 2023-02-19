import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { HealthStatusDTO } from 'pkg-app-shared/src/server/HealthStatusDTO'
import { expect, test } from 'tests/common/TestUtils'

const getHealthStatusResponse = async (request: APIRequestContext): Promise<APIResponse> => {
  return request.get('/api/server/health')
}

test.describe('given working system', () => {
  test.describe('when get health status', () => {
    test('should receive correct status', async ({ request }) => {
      const healthStatusResponse = await getHealthStatusResponse(request)
      const healthStatus: HealthStatusDTO = await healthStatusResponse.json()

      expect(healthStatus).toEqual({
        ok: true,
        database: true,
      })
    })
  })
})
