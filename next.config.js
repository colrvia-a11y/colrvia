let withNextIntl = (config) => config
if (process.env.VITEST_WORKER_ID == null) {
  const createNextIntlPlugin = require('next-intl/plugin')
  withNextIntl = createNextIntlPlugin('./i18n/request.ts')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' }
    ]
  },
  async redirects() {
    return [
      { source: '/projects', destination: '/dashboard', permanent: true },
      { source: '/project/:path*', destination: '/dashboard', permanent: true }
    ]
  }
}

module.exports = withNextIntl(nextConfig)
