import type { Role } from 'pkg-app-shared/src/user/UserDTO'

export type AssignUserRolesOptionsDTO = Readonly<{
  email: string
  roles: Role[]
}>
