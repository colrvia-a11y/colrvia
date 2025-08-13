"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { captureException } from '@/lib/monitoring/sentry'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <html>
      <body className="min-h-dvh bg-background text-foreground">
        <main className="mx-auto max-w-xl p-6 md:p-8 space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold">Something went sideways</h1>
          <p className="text-sm text-muted-foreground">
            We ran into an error while rendering this page. You can try again or head back to Start.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
            >
              Try again
            </button>
            <Link
              href="/start"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
            >
              Go to Start
            </Link>
          </div>

          {error?.digest ? (
            <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
