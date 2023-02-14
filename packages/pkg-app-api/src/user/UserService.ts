import IsEmail from 'isemail'

import type { DbClient } from 'pkg-app-api/src/common/DbClient'
import { requireRole } from 'pkg-app-api/src/user/RoleChecker'
import type { RoleEnum, User } from 'pkg-app-model/client'

export type FindOrCreateUserOptions = Readonly<{
  email: string
  displayName: string
}>

export const findOrCreateUser = async (dbClient: DbClient, options: FindOrCreateUserOptions): Promise<User> => {
  const { email, displayName } = options

  if (!IsEmail.validate(email)) {
    throw new Error('Email is invalid')
  }

  const now = new Date()

  const user = await dbClient.user.upsert({
    where: { email },
    create: { email, displayName, roles: [], createdAt: now, updatedAt: now },
    update: {},
  })

  return user
}

export type AssignUserRolesOptions = Readonly<{
  email: string
  roles: RoleEnum[]
  assignedByUser: User
}>

export const assignUserRoles = async (dbClient: DbClient, options: AssignUserRolesOptions): Promise<User> => {
  const { email, roles, assignedByUser } = options

  if (assignedByUser.email !== process.env.APP_ROLE_ADMIN_EMAIL) {
    requireRole(assignedByUser, 'ADMIN')
  }

  const user = await dbClient.user.update({
    where: { email },
    data: { roles, updatedAt: new Date() },
  })

  return user
}

export const findUserByEmail = async (dbClient: DbClient, email: string): Promise<User> => {
  const user = await dbClient.user.findUniqueOrThrow({
    where: { email },
  })

  return user
}
