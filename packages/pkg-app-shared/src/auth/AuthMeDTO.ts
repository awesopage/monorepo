import type { UserDTO } from 'pkg-app-shared/src/user/UserDTO'

export type AuthMeDTO = Readonly<{
  user?: UserDTO
}>
