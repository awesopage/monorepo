import type { ListDTO } from 'pkg-app-shared/src/list/ListDTO'
import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'

export type ListDetailsDTO = ListDTO &
  Readonly<{
    requestedBy: UserDTO
    approvedBy?: UserDTO
  }>
