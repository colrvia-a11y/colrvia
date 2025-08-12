"use client"
import React from "react"
import Link from "next/link"
import { useTranslations } from 'next-intl'
import enMessages from '@/messages/en.json'

export default function NotFound() {
  let t
  try {
    t = useTranslations('NotFoundPage')
  } catch {
    const m = (enMessages as any).NotFoundPage
    t = (key: string) => m[key]
  }
  return (
    <main className="mx-auto max-w-xl p-6 md:p-8 space-y-4 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('description')}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl px-4 py-2 border border-border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
        >
          {t('goHome')}
        </Link>
        <Link
          href="/start"
          className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
        >
          {t('startStory')}
        </Link>
      </div>
    </main>
  )
}
