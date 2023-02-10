import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenvFlow from 'dotenv-flow'

const configDirPath = fileURLToPath(new URL('../../config', import.meta.url))
const nodeEnv = process.env.NODE_ENV ?? 'development'

const loadEnv = (env) => {
  const configFilePaths = dotenvFlow
    .listDotenvFiles(configDirPath, { node_env: env })
    .filter((configFilePath) => fs.existsSync(configFilePath))

  const configFileNames = configFilePaths.map((configFilePath) => path.relative(configDirPath, configFilePath))

  console.log(`Loading environment ${env} from ${configFileNames.length} files [${configFileNames.join(', ')}]...`)

  dotenvFlow.load(configFilePaths, { silent: true })
}

// Use development env for tests
loadEnv(nodeEnv)
