import { mapValueToNumber, mapValueToString } from 'pkg-app-api/src/common/MapperUtils'
import type { List } from 'pkg-app-model/client'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'

export const mapListToDTO = (list: List): ListDTO => {
  const { id, owner, repo, status, description, starCount, tags, requestedAt, updatedAt, isApproved } = list

  return {
    id: mapValueToString(id),
    owner,
    repo,
    status,
    description,
    starCount: mapValueToNumber(starCount),
    tags,
    requestedAt: mapValueToString(requestedAt),
    updatedAt: mapValueToString(updatedAt),
    isApproved,
  }
}
