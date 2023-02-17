import 'scripts/lib/dotenv-loader.js'

import wretch from 'wretch'

import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { runCommand } from 'scripts/lib/script-utils'

const prismaCommand = './node_modules/.bin/prisma'
const prismaArgv = ['--schema=packages/pkg-app-model/schema/app.prisma']

const taskById: Record<string, () => Promise<void>> = {
  migrate: async () => {
    await runCommand(prismaCommand, ['migrate', 'dev', ...prismaArgv])
  },
  reset: async () => {
    await runCommand(prismaCommand, ['migrate', 'reset', ...prismaArgv])
  },
  generate: async () => {
    await runCommand(prismaCommand, ['generate', ...prismaArgv])
  },
  seed: async () => {
    await wretch(process.env.NEXT_PUBLIC_APP_BASE_URL).post({}, '/api/__test/data/seed').res()
  },
}

const modelSchema = async (argv: string[]) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Should not run this script in production')
  }

  const taskId = argv[0] ?? ''
  const task = taskById[taskId]

  if (!task) {
    throw new Error(`Unknown task: ${taskId}`)
  }

  await task()
}

if (isMainModule(import.meta.url)) {
  runScript(modelSchema)
}
