import type { RoleEnum } from 'pkg-app-model/client'

export type TestUser = Readonly<{
  email: string
  displayName: string
  roles?: RoleEnum[]
}>

export const testUsers: TestUser[] = [
  {
    email: 'admin1@example.com',
    displayName: 'Admin 1',
    roles: ['ADMIN', 'REVIEWER'],
  },
  {
    email: 'admin2@example.com',
    displayName: 'Admin 2',
    roles: ['ADMIN', 'REVIEWER'],
  },
  {
    email: 'reviewer1@example.com',
    displayName: 'Reviewer 1',
    roles: ['REVIEWER'],
  },
  {
    email: 'reviewer2@example.com',
    displayName: 'Reviewer 2',
    roles: ['REVIEWER'],
  },
  {
    email: 'user1@example.com',
    displayName: 'User 1',
  },
  {
    email: 'user2@example.com',
    displayName: 'User 2',
  },
]
