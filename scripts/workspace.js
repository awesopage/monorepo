import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import cpy from 'cpy'

import { isMainModule, runScript } from './lib/script-runner.js'

const PLACEHOLDER_VALUE = '(define in .local files)'

const readEnvFile = async (envPath, ignoreComments = true) => {
  const allLines = fs.existsSync(envPath) ? (await fsp.readFile(envPath, 'utf-8')).split(/\r?\n/) : []

  const envLines = ignoreComments ? allLines.filter((line) => !line.trimStart().startsWith('#')) : allLines
  const placeholderKeys = allLines
    .filter((line) => line.trimStart().startsWith('#') && line.includes(PLACEHOLDER_VALUE))
    .map((line) => {
      const startIndex = line.indexOf('#')
      const endIndex = line.indexOf('=')

      return line.substring(startIndex + 1, endIndex).trim()
    })

  return { envLines, placeholderKeys }
}

const setEnv = (envLines, key, value) => {
  const newEnvLine = `${key}=${value}`
  const searchPrefix = `${key}=`
  const index = envLines.findIndex((envLine) => envLine.startsWith(searchPrefix))

  if (index === -1) {
    envLines.push(newEnvLine)
  } else {
    envLines[index] = newEnvLine
  }
}

const setLocalEnv = async (envPath, extraEnvs, placeholderKeys) => {
  const { envLines } = await readEnvFile(envPath, false)

  Object.keys(extraEnvs).forEach((key) => {
    setEnv(envLines, key, extraEnvs[key])
  })

  envLines.push(
    ...placeholderKeys
      .filter((placeholderKey) => {
        const searchText = `${placeholderKey}=`

        return envLines.every((envLine) => !envLine.includes(searchText))
      })
      .map((placeholderKey) => `# ${placeholderKey}=`),
  )

  await fsp.writeFile(envPath, envLines.join('\n').replaceAll(PLACEHOLDER_VALUE, ''))
}

const taskById = {
  boot: async () => {
    if (!fs.existsSync(new URL('../config/.env.production.local', import.meta.url))) {
      await cpy('config/.env.development', 'config', { flat: true, rename: '.env.production.local' })
    }

    if (process.env.GITPOD_WORKSPACE_ID) {
      await cpy('.gitpod/vscode-settings.json', '.vscode', { flat: true, rename: 'settings.json' })
    }

    const extraEnvs = {
      LOCAL_WORKSPACE_PATH: fileURLToPath(new URL('..', import.meta.url)),
    }

    if (process.env.GITPOD_WORKSPACE_ID) {
      const gitpodUrlSuffix = `${process.env.GITPOD_WORKSPACE_ID}.${process.env.GITPOD_WORKSPACE_CLUSTER_HOST}`

      extraEnvs.NEXT_PUBLIC_APP_BASE_URL = `https://4000-${gitpodUrlSuffix}`
    }

    const { placeholderKeys } = await readEnvFile(new URL('../config/.env.development', import.meta.url))

    await setLocalEnv(new URL('../config/.env.development.local', import.meta.url), extraEnvs, placeholderKeys)
    await setLocalEnv(new URL('../config/.env.production.local', import.meta.url), extraEnvs, placeholderKeys)
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
