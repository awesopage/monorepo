import assert from 'node:assert'
import fsp from 'node:fs/promises'
import path from 'node:path'

import bundleAnalyzer from '@next/bundle-analyzer'

import { nodeEnv } from './scripts/lib/dotenv-loader.js'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

assert.ok(process.env.LOCAL_WORKSPACE_PATH)

const workspacePackages = JSON.parse(
  await fsp.readFile(path.join(process.env.LOCAL_WORKSPACE_PATH, 'workspace-packages.json'), 'utf-8'),
)
const configFiles = ['next.config.js', '.eslintrc.cjs', 'nyc.config.cjs', 'playwright.config.ts']

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withBundleAnalyzer({
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    swcPlugins: [['swc-plugin-coverage-instrument', {}]],
  },
  distDir: `output/${nodeEnv}/nextjs`,
  eslint: {
    dirs: [
      ...workspacePackages
        .map(({ name }) => name)
        .filter((name) => name.startsWith('pkg-'))
        .map((name) => `packages/${name}/src`),
      'pages',
      'scripts',
      'tests',
      ...configFiles,
    ],
  },
})

export default nextConfig
