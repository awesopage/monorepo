import * as iron from '@hapi/iron'
import type { NextApiHandler } from 'next'

import type { AuthInfo } from 'pkg-app-api/src/auth/AuthService'
import { redirectApiResponse } from 'pkg-app-api/src/router/ApiResponse'
import { createApiRouter } from 'pkg-app-api/src/router/ApiRouter'
import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'

const testAuthApiHandler: NextApiHandler = createApiRouter()
  .post(async (req, res) => {
    assertDefined(process.env.NEXT_PUBLIC_APP_BASE_URL, 'NEXT_PUBLIC_APP_BASE_URL')
    assertDefined(process.env.APP_AUTH_SECRET, 'APP_AUTH_SECRET')

    const { email, displayName } = req.body as Readonly<{
      email: string
      displayName?: string
    }>

    const authInfo: AuthInfo = { email, displayName }

    const token = await iron.seal(authInfo, process.env.APP_AUTH_SECRET, {
      ...iron.defaults,
      ttl: 60_000,
    })

    const callbackUrl = [
      `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/auth/callback`,
      `?token=${encodeURIComponent(token)}`,
    ].join('')

    redirectApiResponse(res, callbackUrl)
  })
  .handler()

export default testAuthApiHandler
