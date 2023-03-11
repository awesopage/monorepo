import type { RoleEnum, User } from 'pkg-app-model/client'

export const requireRole = (user: User, role: RoleEnum) => {
  if (!user.roles.includes(role)) {
    throw new Error(`User ${user.email} does not have role ${role}`)
  }
}
