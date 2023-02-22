import type { ListStatus } from 'pkg-app-shared/src/list/ListDTO'

export type CreateListOptionsDTO = Readonly<{
  owner: string
  repo: string
}>

export type UpdateListOptionsDTO = Readonly<{
  description?: string
  starCount?: number
  tags?: string[]
}>

export type SetListStatusDTO = Readonly<{
  status: ListStatus
}>
