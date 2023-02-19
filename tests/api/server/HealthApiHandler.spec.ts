import type { APIRequestContext, APIResponse } from '@playwright/test'

import type { HealthStatusDTO } from 'pkg-app-shared/src/server/HealthStatusDTO'
import { expect, test } from 'tests/common/TestUtils'

test.describe('healthApiHandler', () => {
  test('should return ok health status', async ({ request }) => {
    const healthStatusResponse = await getHealthStatusResponse(request)
    const healthStatus: HealthStatusDTO = await healthStatusResponse.json()

    expect(healthStatus).toEqual({
      ok: true,
      database: true,
    })
  })
})

const getHealthStatusResponse = async (request: APIRequestContext): Promise<APIResponse> => {
  return request.get('/api/server/health')
}
