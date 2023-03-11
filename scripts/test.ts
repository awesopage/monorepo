import 'scripts/lib/dotenv-loader.js'

import fsp from 'node:fs/promises'

import type { JSONReport, JSONReportSuite } from '@playwright/test/types/testReporter'
import type { CloseEvent } from 'concurrently'
import concurrently from 'concurrently'
import wretch from 'wretch'

import { isMainModule, runScript } from 'scripts/lib/script-runner.js'
import { waitFor } from 'scripts/lib/script-utils'
import { testDataApi } from 'tests/common/TestUtils'

const getTestStats = (summary: JSONReport) => {
  const stats = {
    tests: 0,
    passed: 0,
    failed: 0,
    flaky: 0,
    skipped: 0,
  }

  const visitSuite = (suite: JSONReportSuite) => {
    suite.specs.forEach((spec) => {
      stats.tests += spec.tests.length

      spec.tests.forEach((test) => {
        switch (test.status) {
          case 'expected':
            stats.passed += 1
            break
          case 'unexpected':
            stats.failed += 1
            break
          case 'flaky':
            stats.flaky += 1
            break
          case 'skipped':
            stats.skipped += 1
            break
        }
      })
    })

    const subSuites = suite.suites ?? []
    subSuites.forEach(visitSuite)
  }

  summary.suites.forEach(visitSuite)

  return stats
}

const taskById: Record<string, (argv: string[]) => Promise<void>> = {
  'reset-data': async () => {
    await waitFor('Waiting for application to be ready...', 5, async () => {
      await wretch(process.env.INTERNAL_APP_BASE_URL).get('/api/server/health').res()

      return true
    })

    await testDataApi.post({}, '/reset').res()
  },
  'run-with-app': async (argv) => {
    const testArgv = argv.map((argv) => `"${argv}"`).join(' ')

    const { commands } = concurrently([
      {
        name: 'app',
        command: 'npm run test:start-app',
        prefixColor: 'blue',
      },
      {
        name: 'test',
        command: `playwright test ${testArgv}`,
        prefixColor: 'yellow',
        env: {
          STOP_APP_ON_EXIT: true,
        },
      },
    ])

    commands
      .find(({ name }) => name === 'test')
      ?.close.subscribe(({ exitCode }: CloseEvent) => {
        process.exit(exitCode === 0 ? 0 : 1)
      })
  },
  'check-results': async () => {
    const summaryPath = new URL('../output/test/playwright/logs/test-summary.json', import.meta.url)
    const summaryContent = await fsp.readFile(summaryPath, 'utf-8')
    const summary = JSON.parse(summaryContent) as JSONReport

    const stats = getTestStats(summary)

    console.log(
      [
        '',
        `Suites: ${summary.suites.length}`,
        `Tests: ${stats.tests}`,
        `Passed: ${stats.passed}`,
        `Failed: ${stats.failed}`,
        ...(stats.flaky ? [`Flaky: ${stats.flaky}`] : []),
        ...(stats.skipped ? [`Skipped: ${stats.skipped}`] : []),
        '',
      ].join('\n'),
    )

    if (!stats.tests || stats.failed) {
      process.exit(1)
    }
  },
}

const test = async (argv: string[]) => {
  const taskId = argv[0] ?? ''
  const task = taskById[taskId]

  if (!task) {
    throw new Error(`Unknown task: ${taskId}`)
  }

  await task(argv.slice(1))
}

if (isMainModule(import.meta.url)) {
  runScript(test)
}
