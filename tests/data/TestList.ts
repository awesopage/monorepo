import type { ListStatusEnum } from 'pkg-app-model/client'

export type TestList = Readonly<{
  owner: string
  repo: string
  description: string
  starCount: number
  tags: string[]
  requestedByEmail: string
  approvedByEmail?: string
  currentStatus?: ListStatusEnum
}>

export const testLists: TestList[] = [
  {
    owner: 'owner1',
    repo: 'repo1',
    description: 'Awesome List 1',
    starCount: 100_000,
    tags: ['topic1', 'topic2'],
    requestedByEmail: 'user1@example.com',
    approvedByEmail: 'reviewer2@example.com',
  },
  {
    owner: 'owner1',
    repo: 'repo2',
    description: 'Awesome List 2',
    starCount: 50_000,
    tags: ['topic2', 'topic3'],
    requestedByEmail: 'user2@example.com',
    approvedByEmail: 'reviewer1@example.com',
  },
  {
    owner: 'owner2',
    repo: 'repo3',
    description: 'Awesome List 3',
    starCount: 5_000,
    tags: ['topic1', 'topic3'],
    requestedByEmail: 'reviewer1@example.com',
  },
  {
    owner: 'owner2',
    repo: 'repo4-inactive',
    description: 'Awesome List 4 - Inactive',
    starCount: 10_000,
    tags: ['topic2', 'topic4'],
    requestedByEmail: 'admin2@example.com',
    currentStatus: 'INACTIVE',
  },
]
