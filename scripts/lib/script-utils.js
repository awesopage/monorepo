import assert from 'node:assert'

import spawn from 'cross-spawn'

export const runCommand = async (command, argv, options = {}) => {
  console.log(`Running \`${command} ${argv.join(' ')}\`...`)

  const { waitForExit = true } = options

  if (!waitForExit) {
    const childProcess = createChildProcess(command, argv, options)

    childProcess.unref()

    return
  }

  return new Promise((resolve, reject) => {
    const childProcess = createChildProcess(command, argv, options)

    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} failed with exit code ${code}`))
      }
    })

    childProcess.on('error', reject)
  })
}

const createChildProcess = (command, argv, options) => {
  assert.ok(process.env.LOCAL_WORKSPACE_PATH)

  return spawn(command, argv, {
    cwd: process.env.LOCAL_WORKSPACE_PATH,
    stdio: [process.stdin, process.stdout, process.stderr],
    env: { ...process.env, ...(options.env ?? {}) },
  })
}

export const delay = async (seconds) => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1_000))
}

const WAIT_FOR_TIMEOUT_SECONDS = 300

export const waitFor = async (message, interval, condition) => {
  let isReady = false
  const startTime = Date.now()

  while (!isReady) {
    console.log(message)

    await delay(interval)

    try {
      isReady = await condition()
    } catch {
      // Do nothing
    }

    if (!isReady && Date.now() - startTime > WAIT_FOR_TIMEOUT_SECONDS * 1_000) {
      process.exit(1)
    }
  }
}
