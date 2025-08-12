# Monitoring

This project uses [Sentry](https://sentry.io/) for error monitoring.

## Local Development

1. Install dependencies: `npm install` (already includes `@sentry/nextjs`).
2. Create a Sentry project and copy the DSN.
3. Add the DSN to your environment:
   - `NEXT_PUBLIC_SENTRY_DSN` – Sentry project DSN.
   - `NEXT_PUBLIC_SENTRY_ENVIRONMENT` – optional environment name (defaults to `NODE_ENV`).
4. Run the app as usual with `npm run dev`. Errors are reported to the configured DSN.

Omitting `NEXT_PUBLIC_SENTRY_DSN` disables Sentry locally.

## Deployment

Set the same environment variables (`NEXT_PUBLIC_SENTRY_DSN` and optionally `NEXT_PUBLIC_SENTRY_ENVIRONMENT`) in your hosting provider (e.g. Vercel). The DSN should be kept secret but can be exposed client-side for Sentry.

Deployment builds automatically initialize Sentry through `lib/monitoring/sentry.ts`, and API routes and the global error component report exceptions to Sentry.
