"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useTranslations } from 'next-intl'
import enMessages from '@/messages/en.json'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // console.error(error)
  }, [error])
  let t
  try {
    t = useTranslations('ErrorPage')
  } catch {
    const m = (enMessages as any).ErrorPage
    t = (key: string) => m[key]
  }

  return (
    <html>
      <body className="min-h-dvh bg-background text-foreground">
        <main className="mx-auto max-w-xl p-6 md:p-8 space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('description')}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
            >
              {t('tryAgain')}
            </button>
            <Link
              href="/start"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
            >
              {t('goStart')}
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
