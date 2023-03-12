import { mapTimestampToString, mapValueToNumber, mapValueToString } from 'pkg-app-api/src/common/MapperUtils'
import type { ListDetails } from 'pkg-app-api/src/list/ListService'
import { mapUserToDTO } from 'pkg-app-api/src/user/UserMapper'
import type { List } from 'pkg-app-model/client'
import type { ListDetailsDTO } from 'pkg-app-shared/src/list/ListDetailsDTO'
import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'

export const mapListToDTO = (list: List): ListDTO => {
  const {
    id,
    owner,
    repo,
    status,
    description,
    starCount,
    tags,
    requestedAt,
    requestedById,
    updatedAt,
    isApproved,
    approvedById,
  } = list

  return {
    id: mapValueToString(id),
    owner,
    repo,
    status,
    description,
    starCount: mapValueToNumber(starCount),
    tags,
    requestedAt: mapTimestampToString(requestedAt),
    requestedById: mapValueToString(requestedById),
    updatedAt: mapTimestampToString(updatedAt),
    isApproved,
    approvedById: mapValueToString(approvedById),
  }
}

export const mapListDetailsToDTO = (listDetails: ListDetails): ListDetailsDTO => {
  const { requestedBy, approvedBy } = listDetails

  return {
    ...mapListToDTO(listDetails),
    requestedBy: mapUserToDTO(requestedBy),
    approvedBy: approvedBy ? mapUserToDTO(approvedBy) : undefined,
  }
}
