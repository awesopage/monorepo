import { nodeEnv } from 'scripts/lib/dotenv-loader.js'
import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { runCommand } from 'scripts/lib/script-utils'

const dockerCommand = 'docker'
const composeArgv = ['compose', '-p', `ap_${nodeEnv}`, '-f', 'docker/docker-compose-local.yaml']

const taskById: Record<string, () => Promise<void>> = {
  start: async () => {
    await runCommand(dockerCommand, [...composeArgv, 'up', '--detach'])

    await runCommand('npm', ['run', 'model-schema', 'deploy'])
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
