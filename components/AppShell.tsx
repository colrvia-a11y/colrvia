"use client"
import React from 'react'
import Link from 'next/link'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-paper/70 bg-paper/90">
        <div className="max-w-content container flex items-center justify-between py-3">
          <Link href="/" className="font-display text-2xl">Colrvia</Link>
          <nav aria-label="Utility" className="flex gap-3">
            <Link className="text-sm text-ink-subtle hocus:underline" href="/account" aria-label="Account">Account</Link>
          </nav>
        </div>
      </header>
      <main className="container max-w-content py-5 md:py-8">{children}</main>
  <footer className="container max-w-content py-10 text-center text-sm text-ink-subtle" aria-hidden>{/* tagline removed */}</footer>
    </div>
  )
}
