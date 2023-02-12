import wretch from 'wretch'

import { waitFor } from '../scripts/lib/script-utils.js'

const globalSetup = async () => {
  await waitFor('Waiting for application to be ready...', 5, async () => {
    await wretch('http://localhost:4800/api/server/health').get('/').res()

    return true
  })
}

export default globalSetup
