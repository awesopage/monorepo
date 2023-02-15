import type { NextApiHandler } from 'next'

import { sendApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'

const testCoverageApiHandler: NextApiHandler = createApiRouter()
  .post((req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendApiResponse(res, (globalThis as any).__coverage__ ?? {})
  })
  .handler()

export default testCoverageApiHandler
