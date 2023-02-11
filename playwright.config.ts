import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: 'tests',
  snapshotPathTemplate: `snapshots/{testFilePath}/{arg}{ext}`,
  maxFailures: 10,
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4000',
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
    ['junit', { outputFile: 'output/test/playwright/junit.xml' }],
  ],
  // eslint-disable-next-line no-null/no-null
  reportSlowTests: null,
}

export default config
