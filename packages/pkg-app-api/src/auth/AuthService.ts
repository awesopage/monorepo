import * as iron from '@hapi/iron'

import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'

export type AuthInfo = Readonly<{
  email: string
  displayName?: string
  returnUrl?: string
}>

export const verifyAuthInfo = async (token: string): Promise<AuthInfo> => {
  assertDefined(process.env.APP_AUTH_SECRET, 'APP_AUTH_SECRET')

  const { email, displayName, returnUrl } = (await iron.unseal(token, process.env.APP_AUTH_SECRET, {
    ...iron.defaults,
    ttl: 60_000,
  })) as Partial<AuthInfo>

  assertDefined(email, 'email')

  return { email, displayName, returnUrl }
}
