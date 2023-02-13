import wretch from 'wretch'

import { nodeEnv } from 'scripts/lib/dotenv-loader.js'
import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { runCommand, waitFor } from 'scripts/lib/script-utils'

const dockerCommand = 'docker'
const composeArgv = ['compose', '-p', `ap_${nodeEnv}`, '-f', 'docker/docker-compose-local.yaml']

const taskById: Record<string, () => Promise<void>> = {
  start: async () => {
    await runCommand(dockerCommand, [...composeArgv, 'up', '--detach'])

    await waitFor('Waiting for database to be ready...', 5, async () => {
      await wretch(`http://localhost:${process.env.DATABASE_CONSOLE_PORT ?? 4920}`)
        .get('/health')
        .res()

      return true
    })
  },
  stop: async () => {
    await runCommand(dockerCommand, [...composeArgv, 'down'])
  },
  reset: async () => {
    await runCommand(dockerCommand, [...composeArgv, 'down', '--volumes'])
  },
  logs: async () => {
    await runCommand(dockerCommand, [...composeArgv, 'logs', '--follow', '--tail=50'])
  },
}

const localServices = async (argv: string[]) => {
  const taskId = argv[0] ?? ''
  const task = taskById[taskId]

  if (!task) {
    throw new Error(`Unknown task: ${taskId}`)
  }

  await task()
}

if (isMainModule(import.meta.url)) {
  runScript(localServices)
}
