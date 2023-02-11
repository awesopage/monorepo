import fsp from 'node:fs/promises'

import bundleAnalyzer from '@next/bundle-analyzer'

import { nodeEnv } from './scripts/lib/dotenv-loader.js'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

const workspacePackages = JSON.parse(await fsp.readFile(new URL('./workspace-packages.json', import.meta.url)))
const configFiles = ['next.config.js', '.eslintrc.cjs', 'playwright.config.ts']

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withBundleAnalyzer({
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: `build/${nodeEnv}/nextjs`,
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
