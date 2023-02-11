import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

const configFiles = ['next.config.js', '.eslintrc.cjs']

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = withBundleAnalyzer({
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    dirs: ['pages', 'scripts', ...configFiles],
  },
})

export default nextConfig
