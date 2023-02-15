export type Role = 'ADMIN' | 'REVIEWER'

export type UserDTO = Readonly<{
  id: string
  email: string
  displayName: string
  roles: Role[]
  createdAt: string
  updatedAt: string
}>
