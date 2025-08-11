import React from "react"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-6 md:p-8 space-y-4 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold">We couldn’t find that</h1>
      <p className="text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl px-4 py-2 border border-border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
        >
          Go Home
        </Link>
        <Link
          href="/start"
          className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] ring-offset-[var(--surface)]"
        >
          Start a Color Story
        </Link>
      </div>
    </main>
  )
}
