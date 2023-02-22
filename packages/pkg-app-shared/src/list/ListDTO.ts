import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'

export type ListStatus = 'ACTIVE' | 'INACTIVE'

export type ListDTO = Readonly<{
  id: string
  owner: string
  repo: string
  status: ListStatus
  description: string
  starCount: number
  tags: string[]
  requestedAt: string
  requestedBy?: UserDTO
  updatedAt: string
  isApproved: boolean
  approvedBy?: UserDTO
}>
