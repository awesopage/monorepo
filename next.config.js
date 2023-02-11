import fsp from 'node:fs/promises'

import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

const workspacePackages = JSON.parse(await fsp.readFile(new URL('./workspace-packages.json', import.meta.url)))
const configFiles = ['next.config.js', '.eslintrc.cjs']

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withBundleAnalyzer({
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    dirs: [
      ...workspacePackages
        .map(({ name }) => name)
        .filter((name) => name.startsWith('pkg-'))
        .map((name) => `packages/${name}/src`),
      'pages',
      'scripts',
      ...configFiles,
    ],
  },
})

export default nextConfig
