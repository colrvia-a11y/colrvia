"use client"
import React from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
  <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-[var(--color-bg)]">
        <div className="max-w-content container flex items-center justify-between py-3">
          <Link href="/" className="font-display text-2xl">Colrvia</Link>
          <nav aria-label="Utility" className="flex items-center gap-3">
            <Link
              href="/via"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition-colors"
              aria-label="Via Chat"
            >
              Via
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="relative inline-flex rounded-full border border-white/15 bg-white/5 p-2 hover:bg-white/10 transition-colors"
            >
              <span className="absolute inset-[-6px]" aria-hidden />
              <User className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="container max-w-content py-5 md:py-8">{children}</main>
  <footer className="container max-w-content py-10 text-center text-sm opacity-70" aria-hidden>{/* tagline removed */}</footer>
    </div>
  )
}
