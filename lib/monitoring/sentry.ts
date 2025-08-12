import * as Sentry from '@sentry/nextjs'

let initialized = false

export function initSentry() {
  if (initialized || !process.env.NEXT_PUBLIC_SENTRY_DSN) return
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  })
  initialized = true
}

export const captureException = Sentry.captureException

export function withSentry<T extends (...args: any[]) => any>(handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (err) {
      captureException(err)
      throw err
    }
  }) as T
}
