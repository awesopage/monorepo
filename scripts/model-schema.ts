import 'scripts/lib/dotenv-loader.js'

import wretch from 'wretch'

import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { runCommand, waitFor } from 'scripts/lib/script-utils'

const prismaCommand = './node_modules/.bin/prisma'
const prismaArgv = ['--schema=packages/pkg-app-model/schema/app.prisma']

const taskById: Record<string, () => Promise<void>> = {
  migrate: async () => {
    await waitFor('Waiting for database to be ready...', 5, async () => {
      await wretch(`http://localhost:${process.env.DATABASE_CONSOLE_PORT ?? 4920}`)
        .get('/health?ready=1')
        .res()

      return true
    })

    await runCommand(prismaCommand, ['migrate', 'dev', ...prismaArgv])
  },
  reset: async () => {
    await runCommand(prismaCommand, ['migrate', 'reset', ...prismaArgv])
  },
  generate: async () => {
    await runCommand(prismaCommand, ['generate', ...prismaArgv])
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
