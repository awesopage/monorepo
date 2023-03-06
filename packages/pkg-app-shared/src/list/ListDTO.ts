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
  requestedById: string
  updatedAt: string
  isApproved: boolean
  approvedById: string
}>
