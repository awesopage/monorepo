import cpy from 'cpy'

import { isMainModule, runScript } from './lib/script-runner.js'

const taskById = {
  'prepare-gitpod': async () => {
    await cpy('.gitpod/vscode-settings.json', '.vscode', { flat: true, rename: 'settings.json' })
    await cpy('config/.env.development', 'config', { flat: true, rename: '.env.production.local' })
  },
}

const workspace = async (argv) => {
  const taskId = argv[0] ?? ''
  const task = taskById[taskId]

  if (!task) {
    throw new Error(`Unknown task: ${taskId}`)
  }

  await task()
}

if (isMainModule(import.meta.url)) {
  runScript(workspace)
}
