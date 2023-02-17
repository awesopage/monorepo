import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import cpy from 'cpy'

import { isMainModule, runScript } from './lib/script-runner.js'

const setEnv = (envLines, key, value) => {
  const newEnvLine = `${key}=${value}`
  const index = envLines.findIndex((envLine) => envLine.includes(key))

  if (index === -1) {
    envLines.push(newEnvLine)
  } else {
    envLines[index] = newEnvLine
  }
}

const setGitpodEnv = async (envPath) => {
  const envLines = fs.existsSync(envPath) ? (await fsp.readFile(envPath, 'utf-8')).split(/\r?\n/) : []

  const gitpodUrlSuffix = `${process.env.GITPOD_WORKSPACE_ID}.${process.env.GITPOD_WORKSPACE_CLUSTER_HOST}`

  setEnv(envLines, 'NEXT_PUBLIC_APP_BASE_URL', `https://4000-${gitpodUrlSuffix}`)
  setEnv(envLines, 'LOCAL_WORKSPACE_PATH', fileURLToPath(new URL('..', import.meta.url)))

  await fsp.writeFile(envPath, envLines.join('\n'))
}

const taskById = {
  'prepare-gitpod': async () => {
    await cpy('.gitpod/vscode-settings.json', '.vscode', { flat: true, rename: 'settings.json' })
    await cpy('config/.env.development', 'config', { flat: true, rename: '.env.production.local' })

    await setGitpodEnv(new URL('../config/.env.development.local', import.meta.url))
    await setGitpodEnv(new URL('../config/.env.production.local', import.meta.url))
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
