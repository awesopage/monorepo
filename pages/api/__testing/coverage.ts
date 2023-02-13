import type { NextApiHandler } from 'next'

import { createApiRouter, sendApiResponse } from 'pkg-app-api/src/common/RouterUtils'

const coverageApiHandler: NextApiHandler = createApiRouter()
  .post((req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendApiResponse(res, (globalThis as any).__coverage__ ?? {})
  })
  .handler()

export default coverageApiHandler
