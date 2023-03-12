import type { NextApiRequest } from 'next'

import { assertDefined } from 'pkg-app-shared/src/common/AssertUtils'
import { getQueryValue } from 'pkg-app-shared/src/common/QueryUtils'

export const requireListOwnerAndRepo = (req: NextApiRequest) => {
  const owner = getQueryValue(req.query.owner)
  const repo = getQueryValue(req.query.repo)

  assertDefined(owner, 'owner')
  assertDefined(repo, 'repo')

  return { owner, repo }
}
