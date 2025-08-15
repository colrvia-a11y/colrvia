const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const csp = `
default-src 'self';
script-src 'self' 'unsafe-inline' https://app.posthog.com https://*.supabase.co;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://picsum.photos https://*.supabase.co;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co https://app.posthog.com;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';`.replace(/\n/g, " ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.supabase.co" }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
          { key: "Feature-Policy", value: "microphone 'self'" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
        ]
      }
    ];
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /require function is used in a way in which dependencies cannot be statically extracted/,
    ];
    return config;
  }
};

module.exports = withNextIntl(nextConfig);
