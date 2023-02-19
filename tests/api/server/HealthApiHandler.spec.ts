import type { HealthStatusDTO } from 'pkg-app-shared/src/server/HealthStatusDTO'
import { expect, test } from 'tests/common/TestUtils'

test.describe('healthApiHandler', () => {
  test('should return ok health status', async ({ page }) => {
    const getHealth = await page.request.get('/api/server/health')
    const healthStatus: HealthStatusDTO = await getHealth.json()

    expect(healthStatus).toEqual({
      ok: true,
      database: true,
    })
  })
})
