import 'scripts/lib/dotenv-loader.js'

import type { CloseEvent } from 'concurrently'
import concurrently from 'concurrently'
import wretch from 'wretch'

import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { waitFor } from 'scripts/lib/script-utils'
import { testDataApi } from 'tests/common/TestUtils'

const taskById: Record<string, (argv: string[]) => Promise<void>> = {
  'reset-data': async () => {
    await waitFor('Waiting for application to be ready...', 5, async () => {
      await wretch(process.env.INTERNAL_APP_BASE_URL).get('/api/server/health').res()

      return true
    })

    await testDataApi.post({}, '/reset').res()
  },
  'run-with-app': async (argv) => {
    const testArgv = argv.map((argv) => `"${argv}"`).join(' ')

    const { commands } = concurrently([
      {
        name: 'app',
        command: 'npm run test:start-app',
        prefixColor: 'blue',
      },
      {
        name: 'test',
        command: `playwright test ${testArgv}`,
        prefixColor: 'yellow',
        env: {
          STOP_APP_ON_EXIT: true,
        },
      },
    ])

    commands
      .find(({ name }) => name === 'test')
      ?.close.subscribe(({ exitCode }: CloseEvent) => {
        process.exit(exitCode === 0 ? 0 : 1)
      })
  },
}

const test = async (argv: string[]) => {
  const taskId = argv[0] ?? ''
  const task = taskById[taskId]

  if (!task) {
    throw new Error(`Unknown task: ${taskId}`)
  }

  await task(argv.slice(1))
}

if (isMainModule(import.meta.url)) {
  runScript(test)
}
