/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/projects', destination: '/dashboard', permanent: true },
      { source: '/project/:path*', destination: '/dashboard', permanent: true }
    ]
  }
}

module.exports = nextConfig
