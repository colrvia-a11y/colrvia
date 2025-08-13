let withNextIntl = (config) => config
if (process.env.VITEST_WORKER_ID == null) {
  const createNextIntlPlugin = require('next-intl/plugin')
  withNextIntl = createNextIntlPlugin('./i18n/request.ts')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/projects', destination: '/dashboard', permanent: true },
      { source: '/project/:path*', destination: '/dashboard', permanent: true },
      { source: '/preferences/therapist', destination: '/intake', permanent: true },
      { source: '/preferences/therapist/:path*', destination: '/intake', permanent: true }
    ]
  }
}

module.exports = withNextIntl(nextConfig)
