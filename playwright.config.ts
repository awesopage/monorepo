import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: 'tests',
  globalSetup: 'tests/global-setup.ts',
  globalTeardown: 'tests/global-teardown.ts',
  snapshotPathTemplate: `snapshots/{testFilePath}/{arg}{ext}`,
  maxFailures: 10,
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4800',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    trace: 'on-first-retry',
  },
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  outputDir: 'output/test/playwright/tmp',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'output/test/playwright/html' }],
    ['json', { outputFile: 'output/test/playwright/logs/summary.json' }],
    ['junit', { outputFile: 'output/test/playwright/junit.xml' }],
  ],
  // eslint-disable-next-line no-null/no-null
  reportSlowTests: null,
}

export default config
