import '../scripts/lib/dotenv-loader.js'

import fsp from 'node:fs/promises'

import killPort from 'kill-port'
import wretch from 'wretch'

import { delay } from '../scripts/lib/script-utils.js'

const globalTeardown = async () => {
  console.log()
  console.log('Collecting api coverage...')
  console.log()

  const coverageJSON = await wretch(process.env.NEXT_PUBLIC_APP_BASE_URL).post({}, '/api/__testing/coverage').text()

  const outputDirPath = new URL('../output/test/coverage/tmp/', import.meta.url)
  await fsp.mkdir(outputDirPath, { recursive: true })
  await fsp.writeFile(new URL('./api_coverage.json', outputDirPath), coverageJSON)

  if (process.env.STOP_APP_ON_EXIT) {
    console.log()
    console.log('Stopping application...')
    console.log()

    await killPort(4800)
  }

  // Delay a short time for Istanbul to finish processing
  await delay(1)
}

export default globalTeardown
