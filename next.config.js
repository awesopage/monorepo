const configFiles = ['next.config.js', '.eslintrc.cjs']

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    dirs: ['pages', ...configFiles],
  },
}

export default nextConfig
