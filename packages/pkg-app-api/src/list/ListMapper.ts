import { mapValueToString } from 'pkg-app-api/src/common/MapperUtils'
import type { List } from 'pkg-app-model/client'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'

export const mapListToDTO = (list: List): ListDTO => {
  const {
    id,
    owner,
    repo,
    status,
    description,
    repoStarCount,
    tags,
    requestedAt,
    // requestedById,
    updatedAt,
    isApproved,
    // approvedById,
  } = list

  return {
    id: mapValueToString(id),
    owner,
    repo,
    status,
    description,
    starCount: Number(repoStarCount),
    tags,
    requestedAt: mapValueToString(requestedAt),
    // requestedBy: Number(requestedById),
    updatedAt: mapValueToString(updatedAt),
    isApproved,
    // approvedBy
  }
}
