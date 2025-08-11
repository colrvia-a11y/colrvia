"use client"
import React from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#404934] text-[#F7F7F2]">
      <header className="sticky top-0 z-40 bg-[#404934]">
        <div className="max-w-content container flex items-center justify-between py-3">
          <Link href="/" className="font-display text-2xl text-[#F7F7F2]">Colrvia</Link>
          <nav aria-label="Utility" className="flex gap-3">
            <Link href="/account" aria-label="Account" className="rounded-full border border-white/15 bg-white/5 p-2 hover:bg-white/10 transition-colors">
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
