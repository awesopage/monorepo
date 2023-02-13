import concurrently from 'concurrently'

import { isMainModule, runScript } from 'scripts/lib/script-runner.js'

const startAppAndTest = async (argv: string[]) => {
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
    ?.close.subscribe(async ({ code }: CloseEvent) => {
      process.exit(code ? 1 : 0)
    })
}

if (isMainModule(import.meta.url)) {
  runScript(startAppAndTest)
}
