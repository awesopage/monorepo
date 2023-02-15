import 'scripts/lib/dotenv-loader.js'

import wretch from 'wretch'

import { waitFor } from 'scripts/lib/script-utils'

const globalSetup = async () => {
  await waitFor('Waiting for application to be ready...', 5, async () => {
    await wretch(process.env.NEXT_PUBLIC_APP_BASE_URL).get('/api/server/health').res()

    return true
  })
}

export default globalSetup
