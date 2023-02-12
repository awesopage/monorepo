import killPort from 'kill-port'

import { delay } from '../scripts/lib/script-utils.js'

const globalTeardown = async () => {
  if (process.env.STOP_APP_ON_EXIT) {
    console.log()
    console.log('Stopping application...')
    console.log()

    await killPort(4800)
  }

  await delay(1)
}

export default globalTeardown
