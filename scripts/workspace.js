import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import cpy from 'cpy'

import { readEnvFile, updateEnvFile } from './lib/dotenv-utils.js'
import { isMainModule, runScript } from './lib/script-runner.js'

const copyFiles = async () => {
  if (!fs.existsSync(new URL('../config/.env.production.local', import.meta.url))) {
    await cpy('config/.env.development', 'config', { flat: true, rename: '.env.production.local' })
  }

  if (process.env.GITPOD_WORKSPACE_ID) {
    await cpy('.gitpod/vscode-settings.json', '.vscode', { flat: true, rename: 'settings.json' })
  }
}

const updateEnvFiles = async () => {
  const extraEnvs = {
    LOCAL_WORKSPACE_PATH: fileURLToPath(new URL('..', import.meta.url)),
  }

  if (process.env.GITPOD_WORKSPACE_ID) {
    const gitpodUrlSuffix = `${process.env.GITPOD_WORKSPACE_ID}.${process.env.GITPOD_WORKSPACE_CLUSTER_HOST}`

    extraEnvs.NEXT_PUBLIC_APP_BASE_URL = `https://4000-${gitpodUrlSuffix}`
  }

  const { placeholderKeys } = await readEnvFile(new URL('../config/.env.development', import.meta.url))

  await updateEnvFile(new URL('../config/.env.development.local', import.meta.url), extraEnvs, placeholderKeys)
  await updateEnvFile(new URL('../config/.env.production.local', import.meta.url), extraEnvs, placeholderKeys)
}

const taskById = {
  boot: async () => {
    await copyFiles()
    await updateEnvFiles()
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
